from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Client, Product, Quote, Sale
from ..schemas import QuoteCreate, QuoteRead, SaleRead
from .crud import commit, get_or_404

router = APIRouter()


class QuoteStatusUpdate(BaseModel):
    estado: str = Field(pattern="^(cotizada|aceptada|rechazada|vencida|vendida)$")


class StockCheckResult(BaseModel):
    has_stock: bool
    lines: list[dict]


@router.get("/", response_model=list[QuoteRead])
def list_quotes(db: Session = Depends(get_db)):
    query = (
        select(Quote).options(selectinload(Quote.client)).order_by(Quote.fecha.desc())
    )
    return db.scalars(query).all()


@router.post("/", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
def create_quote(payload: QuoteCreate, db: Session = Depends(get_db)):
    get_or_404(db, Client, payload.client_id, "Cliente")
    return commit(db, Quote(**payload.model_dump()))


@router.patch("/{quote_id}/status", response_model=QuoteRead)
def update_quote_status(
    quote_id: int, payload: QuoteStatusUpdate, db: Session = Depends(get_db)
):
    quote = get_or_404(db, Quote, quote_id, "Cotización")
    quote.estado = payload.estado
    if payload.estado in ("vendida", "rechazada", "vencida"):
        quote.produccion_estado = None
    return commit(db, quote)


@router.get("/{quote_id}/stock-check")
def check_stock(quote_id: int, db: Session = Depends(get_db)):
    quote = get_or_404(db, Quote, quote_id, "Cotización")
    lines = quote.lineas_json or []
    result_lines = []
    all_have_stock = True

    for line in lines:
        product_id = line.get("product_id")
        qty_needed = line.get("qty", 1)
        if product_id:
            product = db.get(Product, product_id)
            if product:
                result_lines.append(
                    {
                        "product_id": product_id,
                        "nombre": product.nombre,
                        "qty_needed": qty_needed,
                        "has_stock": True,
                    }
                )
            else:
                result_lines.append(
                    {
                        "product_id": product_id,
                        "nombre": line.get("custom_name", "Producto"),
                        "qty_needed": qty_needed,
                        "has_stock": False,
                    }
                )
                all_have_stock = False
        else:
            result_lines.append(
                {
                    "product_id": None,
                    "nombre": line.get("custom_name", "Personalizado"),
                    "qty_needed": qty_needed,
                    "has_stock": False,
                }
            )
            all_have_stock = False

    return {"has_stock": all_have_stock, "lines": result_lines}


@router.post("/{quote_id}/accept-sale", response_model=SaleRead)
def accept_and_create_sale(quote_id: int, db: Session = Depends(get_db)):
    quote = get_or_404(db, Quote, quote_id, "Cotización")
    if quote.estado != "cotizada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo cotizaciones en estado 'cotizada' pueden ser aceptadas",
        )

    lines = quote.lineas_json or []
    created_sales = []

    for line in lines:
        product_id = line.get("product_id")
        if not product_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La línea '{line.get('custom_name', '')}' no tiene producto asociado para venta directa",
            )
        sale = Sale(
            product_id=product_id,
            client_id=quote.client_id,
            quote_id=quote.id,
            qty=line.get("qty", 1),
            precio_unitario_cop=line.get("precio_unitario_cop", 0),
        )
        db.add(sale)
        created_sales.append(sale)

    quote.estado = "vendida"
    quote.produccion_estado = None
    db.commit()

    for sale in created_sales:
        db.refresh(sale)

    return created_sales[0] if created_sales else None


@router.patch("/{quote_id}/start-production", response_model=QuoteRead)
def start_production(quote_id: int, db: Session = Depends(get_db)):
    quote = get_or_404(db, Quote, quote_id, "Cotización")
    if quote.estado != "cotizada":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo cotizaciones en estado 'cotizada' pueden iniciar producción",
        )
    quote.estado = "aceptada"
    quote.produccion_estado = "en_produccion"
    return commit(db, quote)


@router.patch("/{quote_id}/complete-production", response_model=SaleRead)
def complete_production(quote_id: int, db: Session = Depends(get_db)):
    quote = get_or_404(db, Quote, quote_id, "Cotización")
    if quote.estado != "aceptada" or quote.produccion_estado != "en_produccion":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo cotizaciones en producción pueden completarse",
        )

    lines = quote.lineas_json or []
    created_sales = []

    for line in lines:
        product_id = line.get("product_id")
        if product_id:
            sale = Sale(
                product_id=product_id,
                client_id=quote.client_id,
                quote_id=quote.id,
                qty=line.get("qty", 1),
                precio_unitario_cop=line.get("precio_unitario_cop", 0),
            )
            db.add(sale)
            created_sales.append(sale)

    quote.estado = "vendida"
    quote.produccion_estado = "completada"
    db.commit()

    for sale in created_sales:
        db.refresh(sale)

    return created_sales[0] if created_sales else None
