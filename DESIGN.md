# DESIGN.md — 3D Print Dashboard Visual System

## Design Mode: **Operate**
El visitante completa tareas técnicas (calcular, inventariar, cotizar). Scanabilidad, consistencia, densidad de información y respuesta táctil outrancan expresión visual.

---

## Color System

### Brand
```css
--brand-50:  #eff6ff;
--brand-100: #dbeafe;
--brand-200: #bfdbfe;
--brand-300: #93c5fd;
--brand-400: #60a5fa;
--brand-500: #3b82f6;  /* Primary */
--brand-600: #2563eb;
--brand-700: #1d4ed8;
--brand-800: #1e40af;
--brand-900: #1e3a8a;
--brand-950: #172554;
```

### Neutral (Slate-based para sensación técnica)
```css
--neutral-0:   #ffffff;
--neutral-25:  #fafafa;
--neutral-50:  #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-500: #64748b;
--neutral-600: #475569;
--neutral-700: #334155;
--neutral-800: #1e293b;
--neutral-900: #0f172a;
--neutral-950: #020617;
```

### Semantic
```css
--success-50:  #f0fdf4;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;

--warning-50:  #fffbeb;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;

--danger-50:   #fef2f2;
--danger-500:  #ef4444;
--danger-600:  #dc2626;
--danger-700:  #b91c1c;

--info-50:     #eff6ff;
--info-500:    #3b82f6;
--info-600:    #2563eb;
--info-700:    #1d4ed8;
```

### Surface Tokens
```css
--surface-bg:         var(--neutral-50);
--surface-card:       var(--neutral-0);
--surface-hover:      var(--neutral-50);
--surface-active:     var(--neutral-100);
--surface-border:     var(--neutral-200);
--surface-border-strong: var(--neutral-300);

--text-primary:       var(--neutral-900);
--text-secondary:     var(--neutral-600);
--text-tertiary:      var(--neutral-400);
--text-inverse:       var(--neutral-0);
--text-brand:         var(--brand-700);
```

---

## Typography

### Font Stack
```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace;
--font-display: 'Inter', system-ui, sans-serif; /* weight 700 */
```

### Scale
```css
--text-xs:    0.75rem;   /* 12px */
--text-sm:    0.875rem;  /* 14px */
--text-base:  1rem;      /* 16px */
--text-lg:    1.125rem;  /* 18px */
--text-xl:    1.25rem;   /* 20px */
--text-2xl:   1.5rem;    /* 24px */
--text-3xl:   1.875rem;  /* 30px */
--text-4xl:   2.25rem;   /* 36px */
```

### Line Heights
```css
--leading-tight:   1.1;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
```

### Font Weights
```css
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

---

## Spacing System (4px base)
```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

---

## Border Radius
```css
--radius-none: 0;
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.375rem; /* 6px */
--radius-lg:   0.5rem;   /* 8px */
--radius-xl:   0.75rem;  /* 12px */
--radius-2xl:  1rem;     /* 16px */
--radius-full: 9999px;
```

---

## Shadows
```css
--shadow-xs:   0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm:   0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-focus: 0 0 0 3px var(--brand-200);
```

---

## Breakpoints
```css
--bp-sm:  640px;   /* Mobile landscape / small tablet */
--bp-md:  768px;   /* Tablet portrait */
--bp-lg:  1024px;  /* Tablet landscape / small desktop */
--bp-xl:  1280px;  /* Desktop */
--bp-2xl: 1536px;  /* Large desktop */
```

---

## Component Tokens

### Button
| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary | brand-600 | neutral-0 | none | brand-700 |
| Secondary | neutral-100 | neutral-900 | none | neutral-200 |
| Outline | transparent | neutral-700 | neutral-300 (2px) | neutral-50 |
| Danger | danger-600 | neutral-0 | none | danger-700 |
| Ghost | transparent | neutral-600 | none | neutral-100 |

| Size | Padding | Font | Gap |
|------|---------|------|-----|
| sm | 8px 16px | text-sm | 8px |
| md | 10px 20px | text-base | 10px |
| lg | 14px 28px | text-lg | 12px |

- Radius: `radius-lg` (8px)
- Transition: `150ms ease` colors, `100ms` transform
- Focus: `shadow-focus` + `outline-none`
- Loading: spinner 16px, opacity 0.7

### Input / Select
- Height: 44px (touch-friendly)
- Padding: 0 14px
- Border: 1px solid `surface-border`
- Radius: `radius-lg` (8px)
- Font: `text-base` / `font-normal`
- Placeholder: `text-tertiary`
- Focus: `border-transparent` + `shadow-focus` (brand-200)
- Error: `border-danger-500` + `shadow-focus` (danger-200)
- Disabled: `surface-hover` bg, `text-tertiary`
- Label: `text-sm` `font-medium` `text-secondary`, gap 6px

### Card
- Background: `surface-card`
- Border: 1px `surface-border`
- Radius: `radius-xl` (12px)
- Padding: `space-6` (24px) default
- Shadow: `shadow-sm`
- Hover (interactive): `shadow-md` + `translate-y-[-1px]`

### Table
- Header: `text-sm` `font-semibold` `text-tertiary` `uppercase` `tracking-wide`, py-3 px-4
- Row: `border-y` `surface-border`, hover `surface-hover`
- Cell: `text-sm` `text-primary`, py-4 px-4
- Mono for IDs/codes: `font-mono` `text-xs`

### Badge/Status
- Radius: `radius-full`
- Padding: 4px 10px
- Font: `text-xs` `font-medium`
- Variants use semantic-50 bg + semantic-700 text

---

## Layout Structure

### Sidebar (Desktop)
- Width: 280px (collapsed: 72px)
- Background: `surface-card`
- Border-right: 1px `surface-border`
- Fixed, full height
- Logo area: 64px height, padding `space-6`
- Nav items: 44px height, `space-3` gap, `radius-lg`
- Active: `brand-50` bg + `brand-700` text + `brand-500` left border 3px
- Collapse toggle at bottom

### Sidebar (Mobile/Tablet)
- Drawer: fixed, full height, 280px, `shadow-xl`
- Overlay: `bg-black/40` backdrop-blur-sm
- Swipe to close

### Header
- Height: 64px
- Background: `surface-card`
- Border-bottom: 1px `surface-border`
- Sticky top, z-40
- Left: Page title (text-xl font-semibold)
- Right: User/menu actions

### Main Content
- Padding: `space-6` (24px) desktop, `space-4` (16px) mobile
- Max-width: `1200px` centered (for forms), full for tables
- Gap between sections: `space-6`

---

## Motion
```css
--duration-fast: 100ms;
--duration-base: 150ms;
--duration-slow: 250ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

- All color/border transitions: `duration-base` `ease-out`
- Transform (slide, scale): `duration-fast` `ease-out`
- Modal/drawer: `duration-slow` `ease-in-out`
- Reduce motion respected: disable transforms, keep color transitions

---

## Accessibility
- WCAG AA contrast (4.5:1 text, 3:1 UI elements)
- Focus visible always (3px ring, offset 2px)
- Semantic HTML (nav, main, section, header, footer)
- ARIA labels on icon-only buttons
- Table headers with scope
- Form labels associated
- Live regions for toasts/alerts

---

## Iconography
- Lucide React (consistent 24x24, stroke-width 2)
- Inline with text: 1em × 1em
- Standalone: 20×20 (sm), 24×24 (md), 32×32 (lg)
- Brand emoji only for logo (🖨️), rest use Lucide

---

## Data Display (COP)
- Format: `new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })`
- Font: `font-mono` for amounts ≥ 1000
- Color: `text-primary` for costs, `text-brand` for totals, `text-success-600` for profit/savings

---

## Empty States
- Illustration: 64×64 Lucide icon, `text-tertiary`
- Title: `text-lg` `font-semibold` `text-secondary`
- Description: `text-sm` `text-tertiary`, max-w-xs
- Action: Primary button

---

## Loading States
- Skeleton: `surface-border` bg, `animate-pulse`, `radius-md`
- Spinner: 20×20, `brand-600`, `animate-spin`
- Page: centered, 48×48
- Inline: 16×16 in buttons, 20×20 in cards

---

## Responsive Behavior
| Component | < 640px | 640–1024px | > 1024px |
|-----------|---------|------------|----------|
| Sidebar | Drawer | Drawer | Fixed |
| Forms | Stacked (1 col) | 2-col grid | 2–3 col grid |
| Tables | Horizontal scroll | Horizontal scroll | Full |
| Cards | Full width | 2-col | 2–3 col |
| Buttons | Full width (stack) | Auto | Auto |
| Font scale | Base | Base | Base |
| Padding | space-4 | space-5 | space-6 |

---

## Dark Mode (Future)
- Define `--surface-bg: neutral-950`, `--surface-card: neutral-900`, `--surface-border: neutral-800`
- Text inverted
- Brand lightened: brand-400 primary
- Semantic colors adjusted for dark bg
- Not implemented in v1 — tokens ready