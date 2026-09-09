# PDR: Estabilizacion del MVP y mejoras de arquitectura

**Estado:** En curso — fase local parcialmente implementada  
**Fecha:** 2026-09-07  
**Alcance:** API FastAPI, cliente React/Vite y despliegue Docker Compose

## 1. Contexto

El proyecto tiene una base apropiada para un MVP: backend y frontend separados, routers por dominio y un motor de costos aislado. Sin embargo, la aplicacion no tiene aun un flujo funcional de punta a punta. Existen diferencias entre los modelos, los esquemas, los endpoints y la interfaz, asi como inconsistencias en Docker y en la ubicacion de la base de datos.

El objetivo de este documento es definir la mejora minima necesaria para convertir el prototipo actual en una herramienta fiable para gestionar costos y lotes de impresion 3D, evitando una reescritura prematura.

## 2. Objetivo

Completar y verificar el flujo principal:

1. Configurar impresoras, materiales y parametros globales.
2. Calcular el costo de una impresion sin guardar cambios.
3. Confirmar y guardar un lote de produccion con su desglose de costos.
4. Consultar stock derivado de lotes y ventas.

## 3. Hallazgos actuales

| Area | Hallazgo | Impacto |
| --- | --- | --- |
| Despliegue | `api/Dockerfile` inicia `main:app`, aunque la aplicacion esta en `app.main:app`. | La API no inicia en Docker. |
| Persistencia | Docker, backup y `database.py` apuntan a rutas/nombres distintos para SQLite. | Riesgo de no persistir datos o respaldar una base equivocada. |
| API | El frontend usa el prefijo `/api`; FastAPI registra rutas sin ese prefijo. | Las peticiones de la web devuelven 404. |
| Calculadora | La UI llama a `/lots/calculate`, endpoint que no existe, y no siempre envia `product_id`. | No se puede calcular ni guardar un lote de forma fiable. |
| Contratos | Modelos, esquemas Pydantic y UI usan nombres y campos diferentes (`nombre`/`name`, `estado`/`status`). | Respuestas incompatibles y errores en tiempo de ejecucion. |
| Datos de ejemplo | `merma_pct=0.20` se documenta como 20%, pero el motor divide el valor por 100. | Costos de filamento y reparaciones subestimados. |
| Calidad | `pnpm build` falla por `files: ["src"]` en `tsconfig.json`; no hay pruebas ni CI. | No existe una verificacion confiable antes de desplegar. |

## 4. Decisiones propuestas

### 4.1 Mantener la estructura actual

Se conserva la separacion actual porque es suficiente para el MVP:

```text
api/app/
  routers/       # Endpoints HTTP por dominio
  services/      # Reglas de negocio, incluido el motor de costos
  models.py      # Persistencia SQLAlchemy
  schemas.py     # Contratos HTTP Pydantic
web/src/
  pages/         # Vistas principales
  services/      # Cliente HTTP y tipos compartidos
```

No se introduciran capas adicionales, microservicios, autenticacion ni un estado global de frontend hasta que el flujo principal sea funcional.

### 4.2 Establecer un contrato HTTP unico

Todas las rutas de negocio se publicaran bajo `/api`:

```text
GET  /health
GET  /api/printers
POST /api/printers
GET  /api/materials
POST /api/materials
GET  /api/settings
PUT  /api/settings/{key}
POST /api/lots/calculate
POST /api/lots
GET  /api/inventory
```

El cliente utilizara `VITE_API_BASE_URL`, con `/api` como valor relativo en produccion y `http://localhost:8000/api` como valor de desarrollo.

Cada recurso tendra esquemas Pydantic diferenciados para creacion, actualizacion y respuesta. Los nombres de los campos se mantendran en espanol, alineados con los modelos actuales.

### 4.3 Definir la convencion de porcentajes

Los campos `merma_pct` y `reparaciones_pct` se almacenaran como porcentaje humano:

```text
20 = 20%
10 = 10%
```

El motor de costos continuara convirtiendolos a factor dividiendo por 100. Se corregiran los datos de ejemplo y se agregaran pruebas con valores esperados de las plantillas CSV.

### 4.4 Centralizar la persistencia

`DATABASE_URL` sera la fuente unica de la ubicacion de SQLite. Docker montara el directorio `./data` en la ruta utilizada por esa variable y el servicio de backup leera exactamente ese mismo archivo. La aplicacion no debe imponer una ruta distinta cuando la variable existe.

### 4.5 Preparar migraciones antes de datos reales

Alembic se configurara antes de la primera instalacion con datos operativos. Mientras tanto, el seed podra crear una base de desarrollo, pero el arranque de la API no dependera implicitamente de ejecutar el seed.

## 5. Plan de implementacion

### Estado de implementacion — 2026-09-08

Se completó el alcance local de la Fase 1, sin modificar Docker ni el despliegue NAS:

- Los routers de negocio ya se publican bajo `/api`, compatible con el cliente local.
- Hay contratos Pydantic de creación, actualización y respuesta, con validaciones de referencias y rangos.
- Se implementaron CRUD de impresoras, materiales, productos y clientes; además de cálculo/registro de lotes y creación/consulta de ventas y cotizaciones.
- `POST /api/lots/calculate` no persiste y `POST /api/lots` guarda el desglose calculado.
- Alembic quedó configurado con la revisión inicial `20260908_0001`; para una base nueva se usa `alembic upgrade head`.
- Se añadieron pruebas de API para salud, productos, lotes y cotizaciones. Se ejecutan con `cd api; pytest -q`.

Pendiente para cerrar completamente la Fase 1: corregir y validar Docker/persistencia NAS, pruebas de fórmulas con valores de las plantillas CSV y la integración visual completa del frontend.

### Fase 1: Hacer el flujo principal ejecutable

1. Corregir `api/Dockerfile`, `docker-compose.yml` y la configuracion de base de datos.
2. Definir `/api` como prefijo de los routers y corregir la URL del cliente web.
3. Implementar CRUD minimo real de impresoras, materiales y settings.
4. Crear `POST /api/lots/calculate` sin persistencia.
5. Validar impresora, material, producto, cantidad y valores no negativos antes de calcular.
6. Crear `POST /api/lots` que persista el desglose calculado.
7. Adaptar la calculadora a los contratos finales y mostrar el desglose real.

**Criterio de salida:** desde un navegador se puede crear catalogos, calcular una impresion y guardar un lote sin usar la documentacion interactiva de FastAPI.

### Fase 2: Inventario y trazabilidad comercial

1. Exponer inventario calculado como `SUM(lotes) - SUM(ventas)` por producto.
2. Implementar clientes, ventas y cotizaciones con sus transiciones de estado.
3. Guardar el costo unitario del lote usado en cada venta para calcular rentabilidad historica.
4. Agregar exportacion CSV para lotes, inventario, ventas y cotizaciones.

**Criterio de salida:** el stock no es editable manualmente y se puede rastrear su origen a lotes y ventas.

### Fase 3: Calidad y operacion

1. Corregir `tsconfig.json` y ejecutar `pnpm build` como comprobacion obligatoria.
2. Usar `pnpm` dentro del Dockerfile del frontend.
3. Fijar versiones de dependencias Python y crear un entorno reproducible.
4. Agregar pruebas para el motor de costos, endpoints de lotes e inventario.
5. Configurar un flujo CI para ejecutar pruebas y builds.
6. Restringir CORS a los origenes configurados por entorno.
7. Reemplazar textos con codificacion corrupta en archivos `.tsx`.

## 6. Pruebas minimas requeridas

| Prueba | Resultado esperado |
| --- | --- |
| Costo de filamento con merma de 20% | Se aplica un factor de 1.20. |
| Costo de maquina con reparaciones de 10% | Se aplica un factor de 1.10. |
| Calculo con impresora o material inexistente | HTTP 404 claro, sin error interno. |
| Cantidad cero o negativa | HTTP 422 por validacion. |
| Creacion de lote | Guarda costo total, costo unitario y desglose inmutable. |
| Stock | Coincide con lotes menos ventas. |
| Frontend | `pnpm build` finaliza correctamente. |

## 7. Fuera de alcance por ahora

- Autenticacion, JWT y roles.
- Integracion automatica con OrcaSlicer o Moonraker.
- Panel de metricas y graficos avanzados.
- Importacion masiva y exportacion Excel compleja.
- Separacion en microservicios o sustitucion de SQLite.

Estas iniciativas se retomaran una vez validado el flujo principal y el despliegue persistente en el NAS.

## 8. Riesgos y mitigacion

| Riesgo | Mitigacion |
| --- | --- |
| Cambios de esquema con datos reales | Configurar Alembic antes de operar con datos productivos. |
| Calculos financieros inconsistentes | Mantener montos COP en enteros, documentar redondeo y cubrir formulas con pruebas. |
| Diferencias entre frontend y backend | Usar esquemas de respuesta explicitos y tipos TypeScript derivados o mantenidos junto al cliente API. |
| Perdida de datos en NAS | Volumen unico para `data`, backup probado y restauracion documentada. |

## 9. Resultado esperado

Al finalizar la Fase 1, el proyecto deja de ser un conjunto de pantallas y endpoints de ejemplo y pasa a ser un MVP operativo para registrar configuracion, calcular costos auditables y guardar lotes de produccion. Las fases posteriores agregan inventario y operacion comercial sobre esa base estable.
