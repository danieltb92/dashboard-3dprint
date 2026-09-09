from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .core.config import settings


DEFAULT_DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DEFAULT_DATA_DIR.mkdir(parents=True, exist_ok=True)


def _database_url() -> str:
    configured_url = settings.database_url
    if not configured_url:
        return f"sqlite:///{DEFAULT_DATA_DIR / 'app.db'}"
    # A relative SQLite URL in .env is relative to the repository, never to
    # whichever directory happened to launch Uvicorn or Alembic.
    if configured_url.startswith("sqlite:///./"):
        relative_path = configured_url.removeprefix("sqlite:///./")
        return f"sqlite:///{Path(__file__).resolve().parents[2] / relative_path}"
    return configured_url


SQLALCHEMY_DATABASE_URL = _database_url()
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)


@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
