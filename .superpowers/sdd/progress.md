# SDD ledger — plan: docs/superpowers/plans/2024-11-05-shadcn-ui-migration.md

Task 1: complete (commits 0309da7bc, setup infrastructure)
Task 2-10: complete (commits d8a3b2c1, migrate all UI components to shadcn)
Task 11: complete (cleanup)
Task 12: complete (documentation)

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

Task 1: complete (commits 0309da7, review clean)

Task 2-10: complete (migration of Button, Input, Select, Card, Badge, Table, Skeleton, Toast to shadcn architecture + CSS color aliases)

Task 11-14: complete (pages audit, build verification, clean up)

---
