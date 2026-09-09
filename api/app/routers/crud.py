from typing import Any, Type

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session


def get_or_404(db: Session, model: Type[Any], item_id: int, label: str) -> Any:
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{label} no encontrado")
    return item


def commit(db: Session, item: Any) -> Any:
    try:
        db.add(item)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El registro viola una restricción de integridad") from error
    db.refresh(item)
    return item


def remove(db: Session, item: Any) -> None:
    try:
        db.delete(item)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No se puede eliminar un registro que está en uso") from error
