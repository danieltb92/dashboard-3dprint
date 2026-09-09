from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Client
from ..schemas import ClientCreate, ClientRead, ClientUpdate
from .crud import commit, get_or_404, remove

router = APIRouter()


@router.get("/", response_model=list[ClientRead])
def list_clients(db: Session = Depends(get_db)):
    return db.scalars(select(Client).order_by(Client.nombre)).all()


@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    return commit(db, Client(**payload.model_dump()))


@router.get("/{client_id}", response_model=ClientRead)
def get_client(client_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Client, client_id, "Cliente")


@router.put("/{client_id}", response_model=ClientRead)
def update_client(client_id: int, payload: ClientUpdate, db: Session = Depends(get_db)):
    item = get_or_404(db, Client, client_id, "Cliente")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    return commit(db, item)


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    remove(db, get_or_404(db, Client, client_id, "Cliente"))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
