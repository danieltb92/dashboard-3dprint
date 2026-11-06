import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        brand:
          "border-transparent bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
        success:
          "border-transparent bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-300",
        warning:
          "border-transparent bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-300",
        danger:
          "border-transparent bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-300",
        info:
          "border-transparent bg-info-100 text-info-700 dark:bg-info-500/20 dark:text-info-300",
        neutral:
          "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
