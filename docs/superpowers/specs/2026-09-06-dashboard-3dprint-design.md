# Spec: Dashboard 3D Printing — Diseño Completo

## 1. Visión general
Dashboard auto-alojado en **OMV NAS (Docker)** para:
- Calcular coste de producción desglosado (filamento, electricidad, mano de obra, máquina+mantenimiento, extras)
- Gestión de inventario con SKU, lotes de producción, stock derivado
- Cotizaciones con IVA 19%, descuentos, estados
- Dashboard de estadísticas (producido, stock, vendido, rentabilidad real)
- Backup automático a Google Drive
- Preparado para multi-usuario futuro

**Stack**: FastAPI + SQLite + React (Vite) — 1 contenedor Docker
**Moneda**: COP, locale `es-CO`, IVA 19% por defecto

---

## 2. Módulos / Pantallas

| Módulo | Funcionalidad clave |
|--------|---------------------|
| **Catálogos** | Impresoras (W, €/h máquina), Materiales (€/kg, merma%), Mano de obra (€/h, min prep/post), Parámetros globales (kWh, IVA, margen, embalaje) |
| **Calculadora** | Entrada: pieza, impresora, material, tiempo (h min), peso (g), qty, extras → Salida: desglose 5 componentes + total + precio sugerido (costo × (1+margen%)) → guarda como **ProductionLot** |
| **Inventario** | Productos (SKU autogenerado editable, categoría, foto, precio venta), Lotes (costo real desglose JSON), Stock = Σlotes − Σventas, Alertas stock bajo |
| **Cotizaciones** | Cliente, líneas (producto existente o pieza nueva calculada al vuelo), qty, precio editable, subtotal/IVA/total COP, estados: *cotizada → aceptada → venta / rechazada / vencida*, vista imprimible |
| **Clientes** | Nombre, contacto, notas, historial de cotizaciones/ventas |
| **Dashboard** | KPIs: creados, en stock, vendidos, valor inventario, rentabilidad por producto (venta real − costo real lote), ventas/mes, gráficos simples |
| **Export/Backup** | Botón exportar Excel/CSV (inventario, lotes, ventas, cotizaciones), backup diario automático a Drive vía rclone |

---

## 3. Modelo de datos (SQLite)

```
Printer(id, nombre, consumo_w, precio_maquina, vida_util_horas, reparaciones_pct, activa)
Material(id, nombre, tipo, cop_por_kg, merma_pct, activa)
Settings(key, value)  -- cop_kwh, iva_pct, margen_default, labor_rate_cop, prep_min, packaging_cop
Product(id, sku, nombre, categoria, foto, precio_venta_cop, activa)
ProductionLot(id, product_id, printer_id, material_id, qty, horas, minutos, peso_g,
              desglose_json, costo_unitario_cop, costo_total_cop, fecha, notas)
Sale(id, product_id, qty, precio_unitario_cop, fecha, client_id, quote_id?)
Quote(id, client_id, lineas_json, subtotal, iva, total, estado, vigencia_dias, fecha)
Client(id, nombre, contacto, notas)
User(id, email, hash, role, activo)  -- fase 2, feature flag
```

**Reglas**: montos en `int` COP; stock **derivado** (nunca editado a mano); cada lote guarda su desglose completo en JSON para auditoría.

---

## 4. Motor de costos (fórmulas validadas)

| Componente | Fórmula |
|------------|---------|
| Filamento | `peso_g × (1 + merma%) × (precio_bobina / peso_bobina_g)` |
| Electricidad | `(watts / 1000) × horas × cop_kwh` |
| Mano de obra | `(min_prep + min_post) / 60 × labor_rate_cop` |
| Máquina + mant. | `precio_impresora × (1 + reparaciones%) / (años × 365 × horas_día) × horas_impresión` |
| Otros | Σ artículos extra por pieza |

Totales en COP enteros; horas/gramos con 2 decimales.

---

## 5. Integraciones

| Qué | MVP | Fase 2 |
|-----|-----|--------|
| OrcaSlicer | Manual + botón "Importar .json" | Plugin POST `/api/lots`; Klipper/Moonraker webhook |
| Google Drive | `rclone sync /data gdrive:3dprint-backups/` cron diario (retención 30d) | — |
| Auth | Tablas listas, `ENABLE_AUTH=false` | JWT login, roles, auditoría |
| Export | Excel/CSV desde UI | Import masivo catálogos |

---

## 6. Despliegue OMV

```yaml
# docker-compose.yml
services:
  api:
    build: ./api
    volumes: ["./data:/app/data", "./backups:/app/backups"]
    env_file: .env
    healthcheck: curl -f http://localhost:8000/health || exit 1
  web:
    build: ./web
    ports: ["5173:80"]
    depends_on: [api]
  cron:
    image: alpine
    volumes: ["./data:/data", "./backups:/backups"]
    entrypoint: crond -f -L /dev/stdout
```

**Volúmenes en OMV**:
- `/srv/3dprint/data` → SQLite + `rclone.conf`
- `/srv/3dprint/backups` → exports automáticos

**.env**:
```
DATABASE_URL=sqlite:///data/app.db
JWT_SECRET=<generar>
COP_KWH=839
IVA_PCT=19
DEFAULT_MARGIN_PCT=100
LABOR_RATE_COP=6470
RCLONE_CONFIG=/data/rclone.conf
ENABLE_AUTH=false
CORS_ORIGINS=http://nas.local:5173
```

---

## 7. Próximos pasos

1. Invocar **`writing-plans`** para generar plan de implementación detallado (tasks, orden, tests)
2. Empezar a codificar según el plan