from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Setting
from ..schemas import SettingRead, SettingUpdate
from .crud import commit

router = APIRouter()


@router.get("/", response_model=list[SettingRead])
def list_settings(db: Session = Depends(get_db)):
    return db.scalars(select(Setting).order_by(Setting.key)).all()


@router.put("/{key}", response_model=SettingRead)
def put_setting(key: str, payload: SettingUpdate, db: Session = Depends(get_db)):
    item = db.get(Setting, key)
    if item is None:
        item = Setting(key=key, value=payload.value)
    else:
        item.value = payload.value
    return commit(db, item)
