# Desarrollo Local (sin Docker)

Este documento explica cómo ejecutar el dashboard en modo desarrollo **sin usar Docker**, utilizando **pnpm** para el frontend.

---

## Requisitos

- **Python 3.11+**
- **Node.js 18+**
- **pnpm** (instalado vía `npm install -g pnpm` o `corepack enable`)

---

## Backend (FastAPI)

### 1. Crear entorno virtual e instalar dependencias

```powershell
cd api
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Asegúrate de que el archivo `.env` en la raíz del proyecto tenga:

```env
DATABASE_URL=sqlite:///./data/app.db
COP_KWH=839
IVA_PCT=19
DEFAULT_MARGIN_PCT=100
LABOR_RATE_COP=6470
CORS_ORIGINS=http://localhost:5173
```

### 3. Inicializar la base de datos (primera vez)

```powershell
# Desde la carpeta api/ con el venv activado
python -c "from app.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"
```

### 4. Levantar el servidor de desarrollo

```powershell
# Desde la carpeta api/ con el venv activado
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en: **http://localhost:8000**
- Docs interactivos: **http://localhost:8000/docs**

---

## Frontend (React + Vite)

### 1. Instalar dependencias con pnpm

```powershell
cd web
pnpm install  # Ya ejecutado anteriormente
```

### 2. Levantar el servidor de desarrollo

```powershell
# Desde web/ usar npx por los problemas de ExecutionPolicy
npx pnpm dev
```

O si tienes permisos de ejecución configurados:

```powershell
pnpm dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## Desarrollo simultáneo (Backend + Frontend)

Abre **dos terminales**:

### Terminal 1 (Backend):
```powershell
cd D:\repos\dev\tools\dashboard-3dprint\api
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2 (Frontend):
```powershell
cd D:\repos\dev\tools\dashboard-3dprint\web
npx pnpm dev
```

---

## Verificación

1. Backend: Abre http://localhost:8000/docs y verifica que los endpoints aparezcan.
2. Frontend: Abre http://localhost:5173 y verifica que cargue la interfaz.
3. Integración: El frontend está configurado para llamar al backend en `http://localhost:8000/api` mediante proxy de Vite.

---

## Notas importantes

- **pnpm**: Si `pnpm` no funciona directamente por políticas de PowerShell, usa `npx pnpm <comando>` o `& "C:\Program Files\nodejs\npx.cmd" pnpm <comando>`.
- **SQLite**: La base de datos se crea en `data/app.db` (se crea automáticamente la primera vez).
- **Hot Reload**: Ambos servidores tienen recarga automática (backend con `--reload`, frontend con Vite).

---

## Deploy final en OMV

Para el deploy final en tu NAS, consulta **DEPLOY.md** que contiene las instrucciones para usar Docker Compose.
