from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Boolean,
    DateTime,
    JSON,
)
from sqlalchemy.orm import relationship
import datetime
from .database import Base


class Printer(Base):
    __tablename__ = "printers"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    consumo_w = Column(Float)
    precio_maquina = Column(Integer)
    vida_util_horas = Column(Float)
    reparaciones_pct = Column(Float)
    activa = Column(Boolean, default=True)


class Material(Base):
    __tablename__ = "materials"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    tipo = Column(String)
    cop_por_kg = Column(Integer)
    merma_pct = Column(Float)
    activa = Column(Boolean, default=True)


class Setting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True, index=True)
    value = Column(String)


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    nombre = Column(String)
    categoria = Column(String)
    foto = Column(String, nullable=True)
    precio_venta_cop = Column(Integer)
    activa = Column(Boolean, default=True)


class ProductionLot(Base):
    __tablename__ = "production_lots"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    printer_id = Column(Integer, ForeignKey("printers.id"))
    material_id = Column(Integer, ForeignKey("materials.id"))
    qty = Column(Integer)
    horas = Column(Float)
    minutos = Column(Float)
    peso_g = Column(Float)
    desglose_json = Column(JSON)
    costo_unitario_cop = Column(Integer)
    costo_total_cop = Column(Integer)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    notas = Column(String, nullable=True)

    product = relationship("Product")
    printer = relationship("Printer")
    material = relationship("Material")


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    contacto = Column(String)
    notas = Column(String, nullable=True)


class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=True)
    qty = Column(Integer)
    precio_unitario_cop = Column(Integer)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product")
    client = relationship("Client")


class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    lineas_json = Column(JSON)
    subtotal = Column(Integer)
    iva = Column(Integer)
    total = Column(Integer)
    estado = Column(String)  # cotizada, aceptada, venta, rechazada, vencida
    vigencia_dias = Column(Integer)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    client = relationship("Client")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hash = Column(String)
    role = Column(String)
    activo = Column(Boolean, default=True)
