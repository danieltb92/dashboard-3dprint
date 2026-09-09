from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .core.config import settings
from .database import engine
from .routers import (
    clients,
    lots,
    materials,
    printers,
    products,
    quotes,
    sales,
    settings as settings_router,
)

app = FastAPI(title="Dashboard 3D Print API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

api = "/api"
app.include_router(printers.router, prefix=f"{api}/printers", tags=["printers"])
app.include_router(materials.router, prefix=f"{api}/materials", tags=["materials"])
app.include_router(products.router, prefix=f"{api}/products", tags=["products"])
app.include_router(lots.router, prefix=f"{api}/lots", tags=["lots"])
app.include_router(sales.router, prefix=f"{api}/sales", tags=["sales"])
app.include_router(quotes.router, prefix=f"{api}/quotes", tags=["quotes"])
app.include_router(clients.router, prefix=f"{api}/clients", tags=["clients"])
app.include_router(settings_router.router, prefix=f"{api}/settings", tags=["settings"])


@app.get("/health", tags=["health"])
def healthcheck():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Base de datos no disponible",
        ) from error
    return {"status": "ok"}
