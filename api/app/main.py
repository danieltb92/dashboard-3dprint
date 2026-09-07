from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import (
    printers,
    materials,
    products,
    lots,
    sales,
    quotes,
    clients,
    settings,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(printers.router, prefix="/printers", tags=["printers"])
app.include_router(materials.router, prefix="/materials", tags=["materials"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(lots.router, prefix="/lots", tags=["lots"])
app.include_router(sales.router, prefix="/sales", tags=["sales"])
app.include_router(quotes.router, prefix="/quotes", tags=["quotes"])
app.include_router(clients.router, prefix="/clients", tags=["clients"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])


@app.get("/health")
def healthcheck():
    return {"status": "ok"}
