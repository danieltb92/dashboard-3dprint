Integrate Cost Engine in Lots Router

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