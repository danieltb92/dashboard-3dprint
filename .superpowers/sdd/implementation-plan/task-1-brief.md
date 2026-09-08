# Brief: Task 1 - Calculator.tsx

Implementar la página `web/src/pages/Calculator.tsx`.

## Requisitos
- Formulario para:
  - Selector de impresora (API `/printers`).
  - Selector de material (API `/materials`).
  - Campo número de piezas (int).
  - Campos: horas (float), minutos (float), peso en gramos (float).
- Botón "Importar datos de OrcaSlicer" (placeholder: muestra alert "No implementado").
- Sección "Consumibles extra" (artículos adicionales por pieza).
- Botón "Calcular costo":
  - POST `/api/lots/calculate` con datos del formulario.
  - Mostrar desglose de respuesta.
- Botón "Guardar lote":
  - POST `/api/lots/` con datos para crear un `ProductionLot`.
- Validaciones básicas: campos requeridos.
- Usar componentes de `web/src/components/`.
