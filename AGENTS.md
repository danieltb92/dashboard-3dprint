# AGENTS.md

Guía rápida para agentes trabajando en el dashboard de impresión 3D.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + shadcn/ui (New York) + Radix UI + CVA + pnpm
- **Deploy**: Docker Compose (para OMV NAS)
- **Dev**: Sin Docker (ver DEV-LOCAL.md)

## Comandos clave

### Desarrollo local (preferido)

**Backend** (requiere Python 3.11+):
```powershell
cd api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head  # Aplicar el esquema
# Opcional, solo para reiniciar datos de ejemplo locales:
python seed_data.py
pytest -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (requiere Node 18+, pnpm):
```powershell
cd web
pnpm install  # Primera vez
npx pnpm dev  # Evita problemas de ExecutionPolicy en Windows
```

- Backend: http://localhost:8000 (docs: /docs; negocio: /api/*)
- Frontend: http://localhost:5173 (si está ocupado, Vite usa http://localhost:5174)

### Deploy (Docker en NAS OMV)

```bash
docker compose up --build
```

## Estructura del proyecto

```
dashboard-3dprint/
├── api/                    # Backend FastAPI
│   ├── app/
│   │   ├── main.py        # Entrypoint, CORS, routers
│   │   ├── models.py      # SQLAlchemy models (Printer, Material, Product...)
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── database.py    # SQLite session
│   │   ├── core/
│   │   │   └── config.py  # Configuración centralizada
│   │   ├── services/
│   │   │   └── cost_engine.py  # Motor de costos (fórmulas verificadas)
│   │   └── routers/       # CRUD endpoints (clients, lots, materials, printers, products, quotes, sales, settings)
│   ├── tests/             # Pruebas API (conftest.py, test_api.py)
│   ├── alembic/           # Migraciones de BD
│   ├── requirements.txt
│   └── seed_data.py       # Script para datos de ejemplo
│
├── web/                   # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx # Sidebar + layout principal (colapsable)
│   │   │   └── ui/        # shadcn/ui adaptado: button, input, select, card, badge, table, skeleton, sonner + index.ts
│   │   ├── pages/         # Calculator, Clientes, Company, Consumables, Dashboard, Inventory, Materials, Pedidos, Printers, Quotes, Settings
│   │   ├── services/
│   │   │   └── api.ts     # Axios client (apunta a :8000)
│   │   └── App.tsx        # Router principal
│   ├── package.json       # "type": "module"
│   ├── pnpm-lock.yaml     # ⚠️ Usa pnpm, NO npm
│   └── postcss.config.cjs # ⚠️ .cjs por ES modules
│
├── data/                  # SQLite database (auto-creada)
├── .env                   # Config (COP_KWH, IVA_PCT, etc.)
└── DEV-LOCAL.md           # Instrucciones completas de dev local
```

## Quirks importantes

### Frontend

1. **pnpm obligatorio**: El proyecto usa `pnpm`, no `npm`. Si `pnpm` falla por ExecutionPolicy:
   ```powershell
   npx pnpm <comando>
   # o
   & "C:\Program Files\nodejs\npx.cmd" pnpm <comando>
   ```

2. **PostCSS config**: Es `.cjs` porque `package.json` tiene `"type": "module"`. Usa `@tailwindcss/postcss`, no `tailwindcss` directamente.

3. **API base**: El frontend llama directamente a `http://localhost:8000/api`; los routers de FastAPI están bajo el prefijo `/api`.

4. **Tailwind CSS 4.x**: Usa `@tailwindcss/postcss`. No hay `tailwind.config.js` tradicional para v4.

5. **shadcn con API compatible**: Los componentes `ui/` son shadcn adaptado, no puros. `Input` acepta `label`, `error`, `helperText`, `leftIcon`, `rightIcon`; `Table` acepta `columns`, `data`, `keyExtractor`, `emptyMessage`, `emptyAction`, `striped`, `hoverable`. Al actualizar con `npx shadcn add`, revisar que no se pierdan estos wrappers.

6. **Nombres de archivo**: Los componentes UI usan minúsculas (`button.tsx`), pero se exportan en mayúsculas vía `ui/index.ts`. Importar desde `../components/ui/<archivo>`.

7. **Notificaciones**: Usar `import { toast } from 'sonner'` directamente. `useToast` quedó como compatibilidad en `ui/sonner.tsx`, pero no es el patrón nuevo.

### Backend

1. **Base de datos y migraciones**: SQLite en `data/app.db`. Antes de iniciar o trabajar con una base nueva, aplicar el esquema con:
   ```powershell
   cd api
   alembic upgrade head
   ```
   `seed_data.py` es opcional y exclusivamente para datos de ejemplo; no ejecutarlo contra datos que se quieran conservar. Al repoblar una base existente borra tablas dependientes y desactiva temporalmente las foreign keys; aun así no usar contra datos reales.

2. **Montos en COP**: Todos los precios son **enteros** (sin decimales), en pesos colombianos. Las horas/gramos usan `Float` con 2 decimales.

3. **Motor de costos**: `app/services/cost_engine.py` tiene las fórmulas verificadas desde el Excel del usuario:
   - Filamento: `peso_g × (1 + merma%) × (precio_bobina / peso_bobina_g)`
   - Electricidad: `(watts / 1000) × horas × cop_kwh`
   - Máquina: `precio_impresora × (1 + reparaciones%) / vida_util_horas × horas`
   - Mano de obra: `(min_prep + min_post) / 60 × labor_rate_cop`
   - Overhead: `subtotal × overhead_pct / 100` (default 10%)

4. **Settings**: Se almacenan en tabla `settings` como key-value. Valores por defecto:
   - `cop_kwh=839`
   - `iva_pct=19`
   - `labor_rate_cop=6470`
   - `margen_default=100`
   - `overhead_pct=10`

5. **Migraciones Alembic**: La revisión inicial es `20260908_0001`. Revisiones adicionales:
   - `20260909_0001_expand_client_fields.py` — Campos expandidos de clientes
   - `20260909_0002_add_client_codigo.py` — Código de cliente (CLI-001)
   - `20260911_0001_add_company_consumables.py` — Tablas Company y Consumable
   - `20260912_0001_add_product_inventory_fields.py` — 6 campos de inventario en Product

6. **Pruebas backend**: Ejecutar `cd api; pytest -q`. Las pruebas usan una base SQLite temporal aislada y no deben apuntar a `data/app.db`.

### Problemas conocidos

- **PowerShell ExecutionPolicy**: Windows bloquea scripts `.ps1` de npm/pnpm. Usar `.cmd` directamente o `npx`.
- **Puerto de Vite**: Si `5173` está ocupado, Vite arranca en `5174`; el backend debe tener ambos orígenes en `CORS_ORIGINS` o las peticiones fallan por CORS.
- **Caracteres corruptos en .tsx**: Si aparecen errores como `className=\"...\"`, es corrupción de encoding. Reemplazar `\"` por `"`.

## Flujo de trabajo típico

1. **Nueva feature**:
   - Backend: agregar/modificar model → schema → router → actualizar `main.py`
   - Frontend: crear componente en `pages/` o `components/` → llamar API desde `services/api.ts`

2. **Testing local**:
   - Levantar backend (puerto 8000)
   - Levantar frontend (puerto 5173)
   - Verificar `/docs` para endpoints disponibles
   - Usar `seed_data.py` para datos de prueba

3. **Deploy**:
   - Verificar `.env` con valores de producción
   - `docker compose up --build`
   - Backup automático via rclone (ver DEPLOY.md)

## Variables de entorno clave

```env
DATABASE_URL=sqlite:///./data/app.db
COP_KWH=839                    # Costo kWh en Colombia
IVA_PCT=19                     # IVA Colombia
DEFAULT_MARGIN_PCT=100         # Margen por defecto (precio = costo × 2)
LABOR_RATE_COP=6470           # Tarifa mano de obra por hora
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

## Referencias

- **DEV-LOCAL.md**: Instrucciones detalladas de desarrollo local
- **DEPLOY.md**: Deploy en OMV NAS con Docker + rclone backup
- **docs/superpowers/specs/**: Diseño arquitectónico completo
- **CSV templates**: Excel originales del usuario con fórmulas verificadas
