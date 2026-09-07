# API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement API schemas, flat router structure, healthcheck, and integrate cost engine logic into production lot creation.

**Architecture:** Use a flat `app/routers/` directory, Pydantic schemas, and FastAPI dependencies.

**Tech Stack:** FastAPI, Pydantic.

**Spec:** `docs/superpowers/specs/2026-09-06-dashboard-3dprint-design.md`

## Global Constraints

- Use flat `app/routers/` structure.
- Integrate `cost_engine.calculate_cost()` during `ProductionLot` creation.
- Include healthcheck endpoint.
- CORS enabled.

---

### Task 1: Define Schemas

**Files:**
- Create: `api/app/schemas.py`

- [ ] **Step 1: Define Pydantic models**

```python
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
    quantity: int

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
```

- [ ] **Step 2: Commit**

### Task 2: Implement Routers

**Files:**
- Create: `api/app/routers/printers.py`, `api/app/routers/materials.py`, `api/app/routers/products.py`, `api/app/routers/lots.py`, `api/app/routers/sales.py`, `api/app/routers/quotes.py`, `api/app/routers/clients.py`, `api/app/routers/settings.py`

- [ ] **Step 1: Implement basic CRUD routes for all entities.**
- [ ] **Step 2: Commit**

### Task 3: Integrate Cost Engine in Lots Router

**Files:**
- Modify: `api/app/routers/lots.py`

- [ ] **Step 1: Import cost_engine and call it**

```python
from fastapi import APIRouter, Depends
from ..services.cost_engine import calculate_cost
from ..schemas import ProductionLotBase

router = APIRouter()

@router.post("/lots/")
def create_lot(lot: ProductionLotBase):
    cost_breakdown = calculate_cost(lot.product_id, lot.quantity)
    # Save to database
    return {"lot": lot, "cost_breakdown": cost_breakdown}
```

- [ ] **Step 2: Commit**

### Task 4: Update main.py

**Files:**
- Modify: `api/app/main.py`

- [ ] **Step 1: Configure CORS and include routers**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import printers, materials, products, lots, sales, quotes, clients, settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(printers.router, prefix="/printers", tags=["printers"])
app.include_router(materials.router, prefix="/materials", tags=["materials"])
# ... include other routers

@app.get("/health")
def healthcheck():
    return {"status": "ok"}
```

- [ ] **Step 2: Commit**
