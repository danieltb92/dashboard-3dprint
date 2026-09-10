from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Mapping


def _cop(value: Decimal) -> int:
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def calculate_production_cost(
    printer: Any,
    material: Any,
    settings: Mapping[str, Any],
    peso_g: float,
    minutos: float,
    qty: int,
    extras_cost: int = 0,
    prep_min: float | None = None,
    post_min: float | None = None,
) -> dict[str, int]:
    """Calculate a production batch using Decimal, rounded once to COP."""
    weight = Decimal(str(peso_g))
    hours = Decimal(str(minutos)) / Decimal("60")
    filament = (
        weight
        * (Decimal("1") + Decimal(str(material.merma_pct)) / 100)
        * Decimal(material.cop_por_kg)
        / 1000
    )
    electricity = (
        Decimal(str(printer.consumo_w))
        / 1000
        * hours
        * Decimal(str(settings["cop_kwh"]))
    )
    p_min = Decimal(
        str(prep_min if prep_min is not None else settings.get("prep_min", 0))
    )
    po_min = Decimal(
        str(post_min if post_min is not None else settings.get("post_min", 0))
    )
    labor = (p_min + po_min) / 60 * Decimal(str(settings["labor_rate_cop"]))
    machine = (
        Decimal(printer.precio_maquina)
        * (Decimal("1") + Decimal(str(printer.reparaciones_pct)) / 100)
        / Decimal(str(printer.vida_util_horas))
        * hours
    )
    total = filament + electricity + labor + machine + Decimal(extras_cost)
    total_cop = _cop(total)
    return {
        "filamento": _cop(filament),
        "electricidad": _cop(electricity),
        "mano_obra": _cop(labor),
        "maquina": _cop(machine),
        "otros": extras_cost,
        "total_costo": total_cop,
        "precio_venta_sugerido": _cop(
            total * (Decimal("1") + Decimal(str(settings["margen_default"])) / 100)
        ),
    }
