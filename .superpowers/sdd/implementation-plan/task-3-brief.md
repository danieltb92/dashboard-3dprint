# Brief: Task 3 - Quotes.tsx

Implementar la página `web/src/pages/Quotes.tsx`.

## Requisitos
- Interfaz con dos pestañas: "Nueva cotización" y "Listado".
- **Nueva cotización:**
  - Selector de cliente (`/api/clients`).
  - Tabla dinámica para agregar líneas de cotización (producto, cantidad, precio unitario editable).
  - Cálculo automático:
    - Subtotal = suma(cantidad * precio unitario).
    - IVA = Subtotal * 0.19.
    - Total = Subtotal + IVA.
  - Botón "Guardar cotización" -> POST `/api/quotes`.
- **Listado:**
  - Tabla de cotizaciones existentes (`/api/quotes`).
  - Columnas: ID, Cliente, Total, Estado (Borrador, Enviada, Aceptada, Vencida, Rechazada).
  - Botón "Aceptar" para una cotización -> POST `/api/sales` (para convertir a venta) y reducir stock.
- Usar Tailwind para estilos consistentes con `Calculator.tsx` e `Inventory.tsx`.
