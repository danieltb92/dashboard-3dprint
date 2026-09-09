from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Printer
from ..schemas import PrinterCreate, PrinterRead, PrinterUpdate
from .crud import commit, get_or_404, remove

router = APIRouter()


@router.get("/", response_model=list[PrinterRead])
def list_printers(activa: bool | None = None, db: Session = Depends(get_db)):
    query = select(Printer).order_by(Printer.nombre)
    if activa is not None:
        query = query.where(Printer.activa == activa)
    return db.scalars(query).all()


@router.post("/", response_model=PrinterRead, status_code=status.HTTP_201_CREATED)
def create_printer(payload: PrinterCreate, db: Session = Depends(get_db)):
    return commit(db, Printer(**payload.model_dump()))


@router.get("/{printer_id}", response_model=PrinterRead)
def get_printer(printer_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Printer, printer_id, "Impresora")


@router.put("/{printer_id}", response_model=PrinterRead)
def update_printer(printer_id: int, payload: PrinterUpdate, db: Session = Depends(get_db)):
    item = get_or_404(db, Printer, printer_id, "Impresora")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    return commit(db, item)


@router.delete("/{printer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_printer(printer_id: int, db: Session = Depends(get_db)):
    remove(db, get_or_404(db, Printer, printer_id, "Impresora"))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
