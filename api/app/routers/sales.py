from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Client, Product, Quote, Sale
from ..schemas import SaleCreate, SaleRead
from .crud import commit, get_or_404

router = APIRouter()


@router.get("/", response_model=list[SaleRead])
def list_sales(db: Session = Depends(get_db)):
    return db.scalars(select(Sale).order_by(Sale.fecha.desc())).all()


@router.post("/", response_model=SaleRead, status_code=status.HTTP_201_CREATED)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    get_or_404(db, Product, payload.product_id, "Producto")
    get_or_404(db, Client, payload.client_id, "Cliente")
    if payload.quote_id is not None:
        get_or_404(db, Quote, payload.quote_id, "Cotización")
    return commit(db, Sale(**payload.model_dump()))
