# shadcn UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar todos los componentes UI en `src/components/ui/` a la arquitectura estándar de shadcn (variantes tipadas con `cva`, primitives accesibles de Radix, helper `cn`) manteniendo la paleta de colores actual mediante alias CSS.

**Architecture:**  
- **shadcn** + **CVA** = variantes de estilo tipadas.  
- **Radix Primitives** = comportamiento accesible sin estilos (Dialog, Select, Toast, Dropdown, Tooltip, …).  
- **Alias de colores** en `@theme` mapearán tus variables (`--color-brand-…`, `--color-neutral-…`) a los tokens esperados por shadcn (`--color-primary`, `--color-background`, etc.).  
- **Exports** públicos (`Button`, `Input`, `Select`, `Card`, `Badge`, `Table`, `Skeleton`, `Toast`) se mantienen idénticos para que las páginas existentes sigan trabajando sin cambios.

**Tech Stack:**  
- React 19, TypeScript, Tailwind CSS 4, pnpm, `cva` (`class-variance-authority`), `@radix-ui/react-*` primitives, `lucide-react` (íconos).  

**Spec:** Design system existente en `web/src/index.css` con tokens custom (`--color-brand-*`, `--color-neutral-*`, `--color-surface-*`). Componentes actuales en `web/src/components/ui/`.

---

## Global Constraints
- **No romper la paleta existente** – usar alias CSS para que `bg-primary` = `--color-brand-600`, etc.  
- **Mantener API pública** (`export { Button } from './Button'` …) exacta.  
- **Desactivar** `@headlessui/react` y `@heroicons/react` del `package.json`.  
- **Mantener compatibilidad con dark mode** (ya provista por tus variables `.dark`).  
- **Mantener cobertura de pruebas** – cada componente tiene un archivo de test en `src/components/ui/__tests__/`.  

---

## Task 1 – Preparar entorno y dependencias

**Files:**  
- Modify: `web/package.json` (add Radix, CVA, remove Headless UI & Heroicons).  
- Create: `web/components.json` (shadcn config, style: `new-york`).  
- Create: `web/src/lib/utils.ts` (export `cn` helper).  
- Modify: `web/src/index.css` – añadir alias de colores en `@theme`.  

**Interfaces:**  
- Produces: `cn()` helper function available for all components.

- [ ] **Add dependencies**  

```bash
cd web
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-toast @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-separator
pnpm remove @headlessui/react @heroicons/react
```

- [ ] **Create `components.json`**  

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

- [ ] **Create `src/lib/utils.ts`**  

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Add CSS alias variables** at the end of `@theme` in `src/index.css`  

```css
  /* shadcn alias → custom palette */
  --color-primary: var(--color-brand-600);
  --color-primary-foreground: var(--color-neutral-0);
  --color-secondary: var(--color-neutral-100);
  --color-secondary-foreground: var(--color-neutral-900);
  --color-background: var(--color-surface-bg);
  --color-foreground: var(--color-text-primary);
  --color-muted: var(--color-neutral-100);
  --color-muted-foreground: var(--color-text-secondary);
  --color-accent: var(--color-neutral-100);
  --color-accent-foreground: var(--color-neutral-900);
  --color-border: var(--color-surface-border);
  --color-input: var(--color-surface-border);
  --color-ring: var(--color-brand-500);
  --color-card: var(--color-surface-card);
  --color-card-foreground: var(--color-text-primary);
  --color-destructive: var(--color-danger-600);
  --color-destructive-foreground: var(--color-neutral-0);
  --color-popover: var(--color-surface-card);
  --color-popover-foreground: var(--color-text-primary);
```

- [ ] **Update dark mode aliases** in `.dark` section of `src/index.css`

```css
  .dark {
    /* existing dark overrides... */
    
    /* shadcn dark aliases */
    --color-secondary: var(--color-neutral-800);
    --color-secondary-foreground: var(--color-neutral-100);
    --color-accent: var(--color-neutral-800);
    --color-accent-foreground: var(--color-neutral-100);
  }
```

- [ ] **Update vite.config.ts** to support `@/` alias

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

- [ ] **Run build test**

```bash
npx pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Commit**  

```bash
git add package.json pnpm-lock.yaml components.json src/lib/utils.ts src/index.css vite.config.ts
git commit -m "chore: setup shadcn infrastructure, add aliases, remove unused deps"
```

---

## Task 2 – Migrar `Button`

**Files:**  
- Replace: `src/components/ui/Button.tsx` (old custom) → nuevo shadcn button.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`.
- Produces: `Button` component with props: `variant?: 'primary'|'secondary'|'outline'|'danger'|'ghost'`, `size?: 'sm'|'md'|'lg'`, `isLoading?: boolean`, `leftIcon?: ReactNode`, `rightIcon?: ReactNode`.

- [ ] **Backup old Button**

```bash
cd web
cp src/components/ui/Button.tsx src/components/ui/Button.tsx.old
```

- [ ] **Implement new Button** using `cva` + `Slot` (Radix)  

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground",
        danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 rounded-md px-3",
        md: "h-10 px-4 py-2",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, disabled, leftIcon, rightIcon, fullWidth, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-label="loading" />
        ) : (
          leftIcon && <span>{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

- [ ] **Test manually** – start dev server and check Button renders

```bash
npx pnpm dev
```

Navigate to any page using Button (e.g., `/calculator`). Verify variants render correctly.

- [ ] **Commit**  

```bash
git add src/components/ui/Button.tsx
git commit -m "feat(ui): migrate Button to shadcn (cva + radix Slot)"
```

---

## Task 3 – Migrar `Input`

**Files:**  
- Replace: `src/components/ui/Input.tsx`.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`.
- Produces: `Input` component with standard HTML input props.

- [ ] **Backup old Input**

```bash
cp src/components/ui/Input.tsx src/components/ui/Input.tsx.old
```

- [ ] **Implement new Input** using `cva` + `cn`

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

- [ ] **Test manually** – check Input in forms (e.g., `/materials`, `/clients`)

- [ ] **Commit**

```bash
git add src/components/ui/Input.tsx
git commit -m "feat(ui): migrate Input to shadcn"
```

---

## Task 4 – Migrar `Select`

**Files:**  
- Replace: `src/components/ui/Select.tsx`.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`, `@radix-ui/react-select`.
- Produces: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` components.

- [ ] **Backup old Select**

```bash
cp src/components/ui/Select.tsx src/components/ui/Select.tsx.old
```

- [ ] **Implement new Select** using Radix Select

```typescript
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
```

- [ ] **Test manually** – check Select in forms (e.g., material selector, printer selector)

- [ ] **Commit**

```bash
git add src/components/ui/Select.tsx
git commit -m "feat(ui): migrate Select to shadcn (Radix Select)"
```

---

## Task 5 – Migrar `Card`

**Files:**  
- Replace: `src/components/ui/Card.tsx`.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`.
- Produces: `Card`, `CardHeader`, `CardContent`, `CardFooter` components.

- [ ] **Backup old Card**

```bash
cp src/components/ui/Card.tsx src/components/ui/Card.tsx.old
```

- [ ] **Implement new Card**

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

- [ ] **Test manually** – check Cards throughout app (dashboard, materials, etc.)

- [ ] **Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "feat(ui): migrate Card to shadcn"
```

---

## Task 6 – Migrar `Badge`

**Files:**  
- Replace: `src/components/ui/Badge.tsx`.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`.
- Produces: `Badge` component with `variant?: 'success'|'warning'|'danger'|'info'|'neutral'|'brand'`.

- [ ] **Backup old Badge**

```bash
cp src/components/ui/Badge.tsx src/components/ui/Badge.tsx.old
```

- [ ] **Implement new Badge** using `cva`

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-400",
        warning: "bg-warning-50 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400",
        danger: "bg-danger-50 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400",
        info: "bg-info-50 text-info-700 dark:bg-info-500/20 dark:text-info-400",
        neutral: "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
        brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

- [ ] **Test manually** – check Badges in tables and status indicators

- [ ] **Commit**

```bash
git add src/components/ui/Badge.tsx
git commit -m "feat(ui): migrate Badge to shadcn (cva)"
```

---

## Task 7 – Migrar `Table`

**Files:**  
- Replace: `src/components/ui/Table.tsx`.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`.
- Produces: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` components.

- [ ] **Backup old Table**

```bash
cp src/components/ui/Table.tsx src/components/ui/Table.tsx.old
```

- [ ] **Implement new Table**

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn("bg-primary font-medium text-primary-foreground", className)}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

- [ ] **Test manually** – check Tables in materials, clients, orders pages

- [ ] **Commit**

```bash
git add src/components/ui/Table.tsx
git commit -m "feat(ui): migrate Table to shadcn"
```

---

## Task 8 – Migrar `Skeleton`

**Files:**  
- Replace: `src/components/ui/Skeleton.tsx`.  

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`.
- Produces: `Skeleton` component.

- [ ] **Backup old Skeleton**

```bash
cp src/components/ui/Skeleton.tsx src/components/ui/Skeleton.tsx.old
```

- [ ] **Implement new Skeleton**

```typescript
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
```

- [ ] **Test manually** – check Skeleton in loading states

- [ ] **Commit**

```bash
git add src/components/ui/Skeleton.tsx
git commit -m "feat(ui): migrate Skeleton to shadcn"
```

---

## Task 9 – Migrar `Toast`

**Files:**  
- Replace: `src/components/ui/Toast.tsx`.  
- Create: `src/components/ui/use-toast.ts` (hook for toast notifications).
- Create: `src/components/ui/toaster.tsx` (Toast provider component).

**Interfaces:**  
- Consumes: `cn()` from `@/lib/utils`, `@radix-ui/react-toast`.
- Produces: `Toast`, `ToastAction`, `ToastClose`, `ToastDescription`, `ToastProvider`, `ToastTitle`, `ToastViewport`, `useToast` hook, `Toaster` component.

- [ ] **Backup old Toast**

```bash
cp src/components/ui/Toast.tsx src/components/ui/Toast.tsx.old
```

- [ ] **Implement Toast components**

```typescript
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
```

- [ ] **Implement `use-toast.ts` hook**

```typescript
import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```

- [ ] **Implement `toaster.tsx` component**

```typescript
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
```

- [ ] **Update `App.tsx`** to include Toaster

```typescript
// Add at the top
import { Toaster } from "@/components/ui/toaster"

// Add before closing tag in App component
function App() {
  return (
    <Router>
      {/* existing routes */}
      <Toaster />
    </Router>
  )
}
```

- [ ] **Test manually** – trigger toast notifications in app

- [ ] **Commit**

```bash
git add src/components/ui/toast.tsx src/components/ui/use-toast.ts src/components/ui/toaster.tsx src/App.tsx
git commit -m "feat(ui): migrate Toast to shadcn (Radix Toast)"
```

---

## Task 10 – Actualizar `index.ts` exports

**Files:**  
- Modify: `src/components/ui/index.ts` to export all new components.

**Interfaces:**  
- Produces: Public API for all UI components.

- [ ] **Update exports** in `index.ts`

```typescript
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

export { Input } from './input';
export type { InputProps } from './input';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';

export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

export { Skeleton } from './skeleton';

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
export type { ToastProps, ToastActionElement } from './toast';

export { useToast, toast } from './use-toast';
export { Toaster } from './toaster';
```

- [ ] **Run TypeScript check**

```bash
npx pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Commit**

```bash
git add src/components/ui/index.ts
git commit -m "chore(ui): update component exports"
```

---

## Task 11 – Fix component usage in pages

**Files:**  
- Modify pages that use old component APIs (especially Select, which changed from native to Radix).

**Interfaces:**  
- Consumes: All new UI components.

- [ ] **Audit Select usage** – find all places using old `<select>` API

```bash
grep -r "from '@/components/ui'" src/pages --include="*.tsx" | grep -i select
```

- [ ] **Update Select usage** to new Radix API pattern:

Old pattern:
```tsx
<Select value={value} onChange={(e) => setValue(e.target.value)}>
  <option value="1">Option 1</option>
</Select>
```

New pattern:
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

- [ ] **Update any Button usage** that relied on old internal props

- [ ] **Update any Card usage** – ensure CardHeader/Content/Footer are used correctly

- [ ] **Run dev server and smoke test key pages**

```bash
npx pnpm dev
```

Visit:
- `/calculator` (Button, Input, Select heavy usage)
- `/materials` (Table, Badge, Card)
- `/clients` (Table, Input, Card)
- `/quotes` (complex forms with all components)

- [ ] **Fix any runtime errors** found during smoke test

- [ ] **Commit**

```bash
git add src/pages/
git commit -m "refactor(pages): update component usage for shadcn migration"
```

---

## Task 12 – Clean up backup files

**Files:**  
- Delete: All `.tsx.old` backup files created during migration.

**Interfaces:**  
- None (cleanup only).

- [ ] **Remove backup files**

```bash
cd web/src/components/ui
rm *.old
```

- [ ] **Verify no old component references remain**

```bash
grep -r "@headlessui" src/
grep -r "@heroicons" src/
```

Expected: No matches.

- [ ] **Run full linter**

```bash
npx pnpm lint
```

Fix any linting issues.

- [ ] **Commit**

```bash
git add -A
git commit -m "chore(ui): remove backup files and finalize cleanup"
```

---

## Task 13 – Update documentation

**Files:**  
- Modify: `README.md` – add section on shadcn UI.
- Create: `docs/UI_COMPONENTS.md` – component usage guide.

**Interfaces:**  
- None (documentation only).

- [ ] **Add shadcn section to README**

```markdown
## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built with:
- **Radix UI** primitives for accessibility
- **Tailwind CSS 4** for styling with custom design tokens
- **CVA** (Class Variance Authority) for typed component variants
- **Lucide React** for icons

### Custom Color Palette

The default shadcn color tokens (`primary`, `secondary`, `destructive`, etc.) are mapped to our custom brand palette via CSS variables in `src/index.css`:

- `--color-primary` → `--color-brand-600`
- `--color-background` → `--color-surface-bg`
- `--color-muted` → `--color-neutral-100`
- etc.

This allows shadcn components to use our existing design system automatically, including dark mode support.

### Adding New Components

To add new shadcn components:

```bash
npx shadcn@latest add [component-name]
```

Components are installed to `src/components/ui/` and automatically use our color aliases.

See `docs/UI_COMPONENTS.md` for detailed component usage guide.
```

- [ ] **Create component usage guide**

```markdown
# UI Components Guide

## Button

### Variants
- `primary` (default) - Brand colored action button
- `secondary` - Neutral secondary action
- `outline` - Outlined button
- `danger` - Destructive action
- `ghost` - Transparent button

### Sizes
- `sm` - Small (h-9)
- `md` (default) - Medium (h-10)
- `lg` - Large (h-11)

### Props
- `isLoading?: boolean` - Shows spinner, disables button
- `leftIcon?: ReactNode` - Icon before text
- `rightIcon?: ReactNode` - Icon after text
- `fullWidth?: boolean` - Make button full width
- `asChild?: boolean` - Polymorphic rendering via Slot

### Example

```tsx
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

<Button variant="primary" size="md" leftIcon={<Plus />}>
  Add Item
</Button>
```

## Select

Radix-powered accessible select with search and keyboard navigation.

### Components
- `Select` - Root container
- `SelectTrigger` - Clickable trigger
- `SelectValue` - Displays selected value
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option
- `SelectLabel` - Group label
- `SelectSeparator` - Visual separator

### Example

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select value={material} onValueChange={setMaterial}>
  <SelectTrigger>
    <SelectValue placeholder="Select material" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pla">PLA</SelectItem>
    <SelectItem value="abs">ABS</SelectItem>
    <SelectItem value="petg">PETG</SelectItem>
  </SelectContent>
</Select>
```

## Toast

Radix Toast with imperative API.

### Usage

```tsx
import { useToast } from '@/components/ui/use-toast'

function MyComponent() {
  const { toast } = useToast()
  
  return (
    <Button
      onClick={() => {
        toast({
          title: "Success",
          description: "Material created successfully",
        })
      }}
    >
      Show Toast
    </Button>
  )
}
```

### Variants
- `default` - Standard toast
- `destructive` - Error/warning toast

## Other Components

See [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for full API reference. All components follow the same patterns and automatically use our custom color palette.
```

- [ ] **Commit**

```bash
git add README.md docs/UI_COMPONENTS.md
git commit -m "docs: add shadcn UI migration guide and component documentation"
```

---

## Task 14 – Final verification and push

**Files:**  
- None (verification only).

**Interfaces:**  
- None.

- [ ] **Run full build**

```bash
cd web
npx pnpm build
```

Expected: Build succeeds with no errors or warnings.

- [ ] **Run production preview**

```bash
npx pnpm preview
```

Navigate through key pages and verify:
- All components render correctly
- No console errors
- Dark mode works
- Forms submit correctly
- Tables are interactive

- [ ] **Commit any final fixes**

```bash
git add -A
git commit -m "fix: final adjustments after migration verification"
```

- [ ] **Push to remote**

```bash
git push origin main
```

---

## Post-Migration Notes

### What Was Changed
- ✅ All 8 UI components migrated to shadcn architecture
- ✅ CVA for typed variants
- ✅ Radix primitives for accessibility (Select, Toast, Slot)
- ✅ Custom color palette preserved via CSS aliases
- ✅ Dark mode maintained
- ✅ Removed unused dependencies (@headlessui, @heroicons)

### What Stayed the Same
- ✅ Public component API (exports from `@/components/ui`)
- ✅ Color tokens and design system
- ✅ Dark mode implementation
- ✅ lucide-react icons

### Future Enhancements
Consider adding these shadcn components as needed:
- Dialog (modals)
- Dropdown Menu (context menus)
- Tooltip
- Tabs
- Form (with react-hook-form integration)
- Command (⌘K menu)
- Data Table (with sorting, filtering)

Use `npx shadcn@latest add [component]` to add any of these.

### Customization
To customize component styles:
1. Edit component files directly in `src/components/ui/`
2. Modify `cva` variants as needed
3. Adjust color mappings in `src/index.css` `@theme` section
4. Components are yours to own—no upstream conflicts

### Troubleshooting
- **Component not rendering**: Check console for hydration errors, ensure Radix provider is at app root
- **Styles not applied**: Verify Tailwind is compiling CSS variables, check `@theme` declarations
- **TypeScript errors**: Run `pnpm build` to regenerate types, check `tsconfig.json` paths
