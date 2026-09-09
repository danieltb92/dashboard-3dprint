from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Product
from ..schemas import ProductCreate, ProductRead, ProductUpdate
from .crud import commit, get_or_404, remove

router = APIRouter()


@router.get("/", response_model=list[ProductRead])
def list_products(activa: bool | None = None, db: Session = Depends(get_db)):
    query = select(Product).order_by(Product.nombre)
    if activa is not None:
        query = query.where(Product.activa == activa)
    return db.scalars(query).all()


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    return commit(db, Product(**payload.model_dump()))


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Product, product_id, "Producto")


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)
):
    item = get_or_404(db, Product, product_id, "Producto")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    return commit(db, item)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    remove(db, get_or_404(db, Product, product_id, "Producto"))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
