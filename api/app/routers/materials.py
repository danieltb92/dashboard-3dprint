from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Material
from ..schemas import MaterialCreate, MaterialRead, MaterialUpdate
from .crud import commit, get_or_404, remove

router = APIRouter()


@router.get("/", response_model=list[MaterialRead])
def list_materials(activa: bool | None = None, db: Session = Depends(get_db)):
    query = select(Material).order_by(Material.nombre)
    if activa is not None:
        query = query.where(Material.activa == activa)
    return db.scalars(query).all()


@router.post("/", response_model=MaterialRead, status_code=status.HTTP_201_CREATED)
def create_material(payload: MaterialCreate, db: Session = Depends(get_db)):
    return commit(db, Material(**payload.model_dump()))


@router.get("/{material_id}", response_model=MaterialRead)
def get_material(material_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Material, material_id, "Material")


@router.put("/{material_id}", response_model=MaterialRead)
def update_material(material_id: int, payload: MaterialUpdate, db: Session = Depends(get_db)):
    item = get_or_404(db, Material, material_id, "Material")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    return commit(db, item)


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    remove(db, get_or_404(db, Material, material_id, "Material"))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
