# Brief: Task 2 - Inventory.tsx

Implementar la página `web/src/pages/Inventory.tsx`.

## Requisitos
- Tabla de productos:
  - Columnas: SKU, Nombre, Categoría, Precio venta, Stock (derivado de API).
  - Obtener datos de `/api/products`.
- Botón "Añadir producto":
  - Abre modal con formulario para crear producto (`POST /api/products`).
- Edición de producto:
  - Posibilidad de editar en línea o mediante modal.
- Usar componentes de `web/src/components/` si están disponibles.