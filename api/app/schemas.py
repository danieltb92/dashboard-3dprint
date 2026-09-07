from pydantic import BaseModel
from typing import Optional, List


class PrinterBase(BaseModel):
    name: str


class MaterialBase(BaseModel):
    name: str
    cost_per_gram: float


class ProductBase(BaseModel):
    name: str
    material_id: int
    base_cost: float


class ProductionLotBase(BaseModel):
    product_id: int
    printer_id: int
    material_id: int
    qty: int
    peso_g: float
    horas: float
    minutos: float


class SaleBase(BaseModel):
    product_id: int
    quantity: int
    price: float


class QuoteBase(BaseModel):
    client_id: int
    product_id: int
    quantity: int


class ClientBase(BaseModel):
    name: str


class SettingBase(BaseModel):
    key: str
    value: str
