Update main.py

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