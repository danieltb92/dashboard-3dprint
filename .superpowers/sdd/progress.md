# SDD ledger — plan: docs/superpowers/plans/2024-11-05-shadcn-ui-migration.md

## Plan overview
Migrar componentes UI en `web/src/components/ui/` a shadcn (CVA + Radix), mantener paleta custom via CSS aliases.

## Global constraints
- No romper paleta existente (alias CSS → tokens custom)
- Mantener API pública (export Button, Input, Select, Card, Badge, Table, Skeleton, Toast)
- Desactivar `@headlessui/react`, `@heroicons/react`
- Mantener dark mode (ya implementado)
- Mantener cobertura de pruebas

## Pre‑flight scan
| Tarea | Archivos compartidos / Interfaces | Consume de → Produce para | Observaciones |
|-------|-----------------------------------|--------------------------|---------------|
| 1 (setup) | `package.json`, `components.json`, `src/lib/utils.ts`, `src/index.css` | — | Configura shadcn + alias |
| 2 (Button) | `src/components/ui/Button.tsx` | `cn()` (Task 1) | Produce `Button` export |
| 3 (Input) | `src/components/ui/Input.tsx` | `cn()` | Export `Input` |
| 4 (Select) | `src/components/ui/Select.tsx` | `cn()`, `@radix-ui/react-select` | Export `Select` y subcomponentes |
| 5 (Card) | `src/components/ui/Card.tsx` | `cn()` | Export `Card`, `CardHeader`, etc. |
| 6 (Badge) | `src/components/ui/Badge.tsx` | `cn()`, `cva` | Export `Badge` |
| 7 (Table) | `src/components/ui/Table.tsx` | `cn()` | Export `Table` y subcomponentes |
| 8 (Skeleton) | `src/components/ui/Skeleton.tsx` | `cn()` | Export `Skeleton` |
| 9 (Toast) | `src/components/ui/toast.tsx`, `use‑toast.ts`, `toaster.tsx` | `cn()`, `@radix-ui/react-toast` | Produce `useToast`, `Toaster` |
| 10 (index) | `src/components/ui/index.ts` | Todos los exports anteriores | Re‑export agrupado |
| 11 (fix pages) | `src/pages/*.tsx` | Usan los componentes migrados | Ajustar API (especialmente Select) |
| 12 (cleanup) | Elimina `.tsx.old` | — | Limpieza post‑migración |
| 13 (docs) | `README.md`, `docs/UI_COMPONENTS.md` | — | Documentación |
| 14 (final verification) | — | — | Build + smoke test |

**No hay conflictos internos:** cada tarea toca archivos distintos o sigue dependencias claras.  

**Rulings pre‑flight:** ninguno.

## Ledger de progreso
BASE: `c23f631` (commit inicial con plan)

---

Task 1: Preparar entorno y dependencias

Task 2: Migrar `Button`

Task 3: Migrar `Input`

Task 4: Migrar `Select`

Task 5: Migrar `Card`

Task 6: Migrar `Badge`

Task 7: Migrar `Table`

Task 8: Migrar `Skeleton`

Task 9: Migrar `Toast`

Task 10: Actualizar `index.ts` exports

Task 11: Fix component usage in pages

Task 12: Clean up backup files

Task 13: Update documentation

Task 14: Final verification and push

---
