from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Company
from ..schemas import CompanyCreate, CompanyRead, CompanyUpdate
from .crud import commit, get_or_404

router = APIRouter()


@router.get("/", response_model=list[CompanyRead])
def list_companies(db: Session = Depends(get_db)):
    return db.scalars(select(Company).order_by(Company.id)).all()


@router.get("/{company_id}", response_model=CompanyRead)
def get_company(company_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, Company, company_id, "Empresa")


@router.post("/", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    company = Company(**payload.model_dump())
    return commit(db, company)


@router.put("/{company_id}", response_model=CompanyRead)
def update_company(
    company_id: int, payload: CompanyUpdate, db: Session = Depends(get_db)
):
    company = get_or_404(db, Company, company_id, "Empresa")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    return commit(db, company)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    company = get_or_404(db, Company, company_id, "Empresa")
    db.delete(company)
    db.commit()
