from datetime import datetime
from typing import Any, Annotated

from pydantic import BaseModel, ConfigDict, Field

NonEmpty = Annotated[str, Field(min_length=1, max_length=255)]
PositiveInt = Annotated[int, Field(gt=0)]
NonNegativeInt = Annotated[int, Field(ge=0)]
PositiveFloat = Annotated[float, Field(gt=0)]
NonNegativeFloat = Annotated[float, Field(ge=0)]


class APIModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class ORMModel(APIModel):
    model_config = ConfigDict(from_attributes=True)


class PrinterCreate(APIModel):
    nombre: NonEmpty
    consumo_w: PositiveFloat
    precio_maquina: PositiveInt
    vida_util_horas: PositiveFloat
    reparaciones_pct: NonNegativeFloat = 0
    activa: bool = True


class PrinterUpdate(PrinterCreate):
    pass


class PrinterRead(PrinterCreate, ORMModel):
    id: int


class MaterialCreate(APIModel):
    nombre: NonEmpty
    tipo: NonEmpty
    cop_por_kg: PositiveInt
    merma_pct: NonNegativeFloat = 0
    activa: bool = True


class MaterialUpdate(MaterialCreate):
    pass


class MaterialRead(MaterialCreate, ORMModel):
    id: int


class ProductCreate(APIModel):
    sku: NonEmpty
    nombre: NonEmpty
    categoria: NonEmpty
    foto: str | None = None
    precio_venta_cop: PositiveInt
    activa: bool = True


class ProductUpdate(ProductCreate):
    pass


class ProductRead(ProductCreate, ORMModel):
    id: int


class ClientCreate(APIModel):
    nombre: NonEmpty
    contacto: NonEmpty
    notas: str | None = None


class ClientUpdate(ClientCreate):
    pass


class ClientRead(ClientCreate, ORMModel):
    id: int


class LotCalculate(APIModel):
    printer_id: PositiveInt
    material_id: PositiveInt
    qty: PositiveInt
    peso_g: PositiveFloat
    minutos: NonNegativeFloat


class ProductionLotCreate(LotCalculate):
    product_id: int | None = Field(default=None, gt=0)
    notas: str | None = None


class CostBreakdown(APIModel):
    filamento: int
    electricidad: int
    mano_obra: int
    maquina: int
    otros: int
    total_costo: int
    precio_venta_sugerido: int


class ProductionLotRead(ORMModel):
    id: int
    product_id: int | None
    printer_id: int
    material_id: int
    qty: int
    horas: float
    minutos: float
    peso_g: float
    desglose_json: dict[str, Any]
    costo_unitario_cop: int
    costo_total_cop: int
    fecha: datetime
    notas: str | None


class QuoteCreate(APIModel):
    client_id: PositiveInt
    lineas_json: list[dict[str, Any]] = Field(min_length=1)
    subtotal: NonNegativeInt
    iva: NonNegativeInt = 0
    envio_cop: NonNegativeInt = 0
    otros_cargos_cop: NonNegativeInt = 0
    total: NonNegativeInt
    estado: Annotated[
        str, Field(pattern="^(cotizada|aceptada|rechazada|vencida|vendida)$")
    ]
    produccion_estado: str | None = None
    vigencia_dias: PositiveInt


class QuoteRead(QuoteCreate, ORMModel):
    id: int
    fecha: datetime
    client: ClientRead | None = None


class SaleCreate(APIModel):
    product_id: PositiveInt
    client_id: PositiveInt
    quote_id: int | None = Field(default=None, gt=0)
    qty: PositiveInt
    precio_unitario_cop: PositiveInt


class SaleRead(SaleCreate, ORMModel):
    id: int
    fecha: datetime


class SettingUpdate(APIModel):
    value: NonEmpty


class SettingRead(ORMModel):
    key: str
    value: str
