from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.config import settings as app_settings
from ..database import get_db
from ..models import Material, Printer, Product, ProductionLot, Setting
from ..schemas import (
    CostBreakdown,
    LotCalculate,
    ProductionLotCreate,
    ProductionLotRead,
)
from ..services.cost_engine import calculate_production_cost
from .crud import commit, get_or_404

router = APIRouter()


def get_cost_settings(db: Session) -> dict[str, int | float]:
    saved = {item.key: item.value for item in db.scalars(select(Setting)).all()}
    return {
        "cop_kwh": int(saved.get("cop_kwh", app_settings.cop_kwh)),
        "labor_rate_cop": int(saved.get("labor_rate_cop", app_settings.labor_rate_cop)),
        "margen_default": int(
            saved.get("margen_default", app_settings.default_margin_pct)
        ),
    }


def calculate(payload: LotCalculate, db: Session) -> dict[str, int]:
    printer = get_or_404(db, Printer, payload.printer_id, "Impresora")
    material = get_or_404(db, Material, payload.material_id, "Material")
    if not printer.activa or not material.activa:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La impresora y el material deben estar activos",
        )
    return calculate_production_cost(
        printer,
        material,
        get_cost_settings(db),
        payload.peso_g,
        payload.minutos,
        payload.qty,
        prep_min=payload.prep_min,
        post_min=payload.post_min,
    )


@router.post("/calculate", response_model=CostBreakdown)
def calculate_lot(payload: LotCalculate, db: Session = Depends(get_db)):
    return calculate(payload, db)


@router.get("/", response_model=list[ProductionLotRead])
def list_lots(db: Session = Depends(get_db)):
    return db.scalars(select(ProductionLot).order_by(ProductionLot.fecha.desc())).all()


@router.post("/", response_model=ProductionLotRead, status_code=status.HTTP_201_CREATED)
def create_lot(payload: ProductionLotCreate, db: Session = Depends(get_db)):
    if payload.product_id is not None:
        get_or_404(db, Product, payload.product_id, "Producto")
    breakdown = calculate(payload, db)
    minutes = float(payload.minutos)
    item = ProductionLot(
        **payload.model_dump(),
        horas=minutes / 60,
        desglose_json=breakdown,
        costo_unitario_cop=breakdown["total_costo"] // payload.qty,
        costo_total_cop=breakdown["total_costo"],
    )
    return commit(db, item)
