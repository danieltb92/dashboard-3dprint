from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ProductionLot, Product, Printer, Material, Setting
from ..schemas import ProductionLotBase
from ..services.cost_engine import calculate_production_cost
from typing import Dict, Any

router = APIRouter()


def get_settings_dict(db: Session) -> Dict[str, Any]:
    settings = db.query(Setting).all()
    return {s.key: s.value for s in settings}


@router.post("/")
def create_lot(lot: ProductionLotBase, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == lot.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Assuming printer_id and material_id are required for cost calculation
    # They should be part of the lot request or fetched from product default
    # For this task, assuming they are passed or fetched somehow
    # Let's add them to the schema for now

    # Re-reading models to see how ProductionLot is created
    # Need to fetch related objects for cost engine
    printer = db.query(Printer).filter(Printer.id == lot.printer_id).first()
    material = db.query(Material).filter(Material.id == lot.material_id).first()
    settings = get_settings_dict(db)

    cost_breakdown = calculate_production_cost(
        printer=printer,
        material=material,
        settings=settings,
        peso_g=lot.peso_g,
        horas=lot.horas,
        minutos=lot.minutos,
    )

    db_lot = ProductionLot(
        **lot.dict(),
        desglose_json=cost_breakdown,
        costo_unitario_cop=cost_breakdown["total"] // lot.qty,
        costo_total_cop=cost_breakdown["total"],
    )
    db.add(db_lot)
    db.commit()
    db.refresh(db_lot)
    return db_lot
