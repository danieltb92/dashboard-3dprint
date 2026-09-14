from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Consumable
from ..schemas import ConsumableCreate, ConsumableRead, ConsumableUpdate
from .crud import commit, get_or_404

router = APIRouter()


@router.get("/", response_model=list[ConsumableRead])
def list_consumables(db: Session = Depends(get_db)):
    return db.scalars(select(Consumable).order_by(Consumable.nombre)).all()


@router.get("/{consumable_id}", response_model=ConsumableRead)
def get_consumable(consumable_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Consumable, consumable_id, "Consumible")


@router.post("/", response_model=ConsumableRead, status_code=status.HTTP_201_CREATED)
def create_consumable(payload: ConsumableCreate, db: Session = Depends(get_db)):
    consumable = Consumable(**payload.model_dump())
    return commit(db, consumable)


@router.put("/{consumable_id}", response_model=ConsumableRead)
def update_consumable(
    consumable_id: int, payload: ConsumableUpdate, db: Session = Depends(get_db)
):
    consumable = get_or_404(db, Consumable, consumable_id, "Consumible")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(consumable, field, value)
    return commit(db, consumable)


@router.delete("/{consumable_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consumable(consumable_id: int, db: Session = Depends(get_db)):
    consumable = get_or_404(db, Consumable, consumable_id, "Consumible")
    db.delete(consumable)
    db.commit()
