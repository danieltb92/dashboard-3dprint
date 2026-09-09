from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_DIR = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    database_url: str | None = None
    cors_origins: str = "http://localhost:5173"
    cop_kwh: int = 839
    iva_pct: int = 19
    default_margin_pct: int = 100
    labor_rate_cop: int = 6470

    model_config = SettingsConfigDict(
        env_file=PROJECT_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
