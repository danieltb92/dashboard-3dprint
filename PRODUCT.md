# PRODUCT.md — 3D Print Dashboard

## Product Identity
**Name:** DCapital.co — 3D Print Dashboard  
**Tagline:** Calcula, gestiona y cotiza tus impresiones 3D con precisión  
**Category:** Herramienta de gestión de taller / Manufacturing SaaS  
**Audience:** Makers, talleres de impresión 3D, pequeñas fábricas, emprendedores de impresión bajo demanda  

## Core Value
Elimina la incertidumbre en el costo real de cada pieza impresa. Une cálculo de costos (filamento, electricidad, máquina, mano de obra, overhead), inventario de productos y cotizaciones a clientes en una sola herramienta — con fórmulas validadas desde Excel real de usuario.

## Key Workflows
1. **Calculadora** — Seleccionar impresora + material + parámetros → ver desglose de costos en COP (6 factores) → precio venta sugerido → guardar como lote
2. **Inventario** — CRUD de productos (SKU, nombre, categoría, color, línea, stock actual/pedido, alerta, status, precio, estado) → catálogo para cotizaciones
3. **Cotizaciones** — Nueva cotización (cliente + líneas de productos/servicios) → cálculo automático subtotal/IVA/total → listado con estados → encabezado con marca DCapital.co
4. **Empresa** — Configuración de datos empresa (logo, dirección, teléfono, email, NIT) → aparece en cotizaciones
5. **Consumibles** — CRUD de consumibles del taller (limpieza, corte, adhesivos, herramientas, otros) → control de stock

## Technical Constraints
- **Stack:** React 19 + Vite 6 + TypeScript + Tailwind CSS 4 + shadcn/ui + Radix UI + CVA + pnpm
- **Backend:** FastAPI en `:8000` (CORS configurado)
- **Datos:** COP enteros (sin decimales), horas/gramos con 2 decimales
- **Deploy:** Docker Compose para OMV NAS
- **Navegadores:** Chrome/Edge/Firefox últimos 2 versiones + Safari iOS

## Brand DNA
- **Personalidad:** Precisa, confiable, de taller — no "startup saas" genérica
- **Tono:** Directo, técnico pero accesible, sin jerga innecesaria
- **Promesa:** "El costo real, sin sorpresas"
- **Marca:** DCapital.co — sidebar azul oscuro, cotizaciones con encabezado propio

## Competitive Differentiation
- Fórmulas de costo validadas contra Excel real de usuario colombiano
- 6 factores de costo: filamento, electricidad, mano de obra, máquina, overhead y otros
- Unidades en COP (pesos colombianos) nativamente
- Workflow integrado: calcular → inventariar → cotizar → empresa → consumibles
- Diseñado para talleres reales, no demos

## Success Metrics
- Tiempo para primera cotización < 3 min
- Cero errores de cálculo reportados
- Adopción semanal > 60% usuarios activos