from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Client
from ..schemas import ClientCreate, ClientRead, ClientUpdate
from .crud import commit, get_or_404, remove

router = APIRouter()


def _generate_codigo(db: Session) -> str:
    last = db.scalars(select(Client.codigo).order_by(Client.id.desc()).limit(1)).first()
    if last:
        num = int(last.split("-")[1]) + 1
    else:
        num = 1
    return f"CLI-{num:03d}"


@router.get("/", response_model=list[ClientRead])
def list_clients(db: Session = Depends(get_db)):
    return db.scalars(select(Client).order_by(Client.nombre)).all()


@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["codigo"] = _generate_codigo(db)
    return commit(db, Client(**data))


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
