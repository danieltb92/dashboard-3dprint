from typing import Dict, Any


def calculate_production_cost(
    printer: Any,  # Printer model
    material: Any,  # Material model
    settings: Dict[str, Any],  # Settings dictionary
    peso_g: float,
    horas: float,
    minutos: float,
    extras_cost: int = 0,
) -> Dict[str, Any]:

    total_horas = horas + (minutos / 60)

    # 1. Filamento: peso_g * (1 + merma%) * (cop_por_kg / 1000)
    costo_filamento = (
        peso_g * (1 + (material.merma_pct / 100)) * (material.cop_por_kg / 1000)
    )

    # 2. Electricidad: (watts / 1000) * horas * cop_kwh
    costo_electricidad = (
        (printer.consumo_w / 1000) * total_horas * float(settings.get("cop_kwh", 839))
    )

    # 3. Mano de obra: (min_prep + min_post) / 60 * labor_rate_cop
    # Assuming min_prep + min_post are in settings
    prep_min = float(settings.get("prep_min", 0))
    # Where is min_post? It is not explicitly in the settings table, but the formula requires it.
    # I'll assume they meant prep + post time in settings.
    post_min = float(settings.get("post_min", 0))
    labor_rate = float(settings.get("labor_rate_cop", 6470))
    costo_labor = ((prep_min + post_min) / 60) * labor_rate

    # 4. Máquina + mant.: precio_impresora * (1 + reparaciones%) / (vida_util_horas) * horas_impresión
    costo_maquina = (
        printer.precio_maquina
        * (1 + (printer.reparaciones_pct / 100))
        / printer.vida_util_horas
    ) * total_horas

    # 5. Otros
    costo_otros = extras_cost

    total_costo = (
        costo_filamento + costo_electricidad + costo_labor + costo_maquina + costo_otros
    )

    return {
        "filamento": int(costo_filamento),
        "electricidad": int(costo_electricidad),
        "mano_de_obra": int(costo_labor),
        "maquina": int(costo_maquina),
        "otros": int(costo_otros),
        "total": int(total_costo),
    }
