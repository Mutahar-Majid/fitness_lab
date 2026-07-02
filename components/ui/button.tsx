import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[7px] text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--steel-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--ink)] bg-[var(--ink)] text-white hover:border-[var(--signal-red)] hover:bg-[var(--signal-red)]",
        secondary:
          "border border-[var(--line-strong)] bg-[var(--surface-panel)] text-[var(--ink)] hover:border-[var(--steel-blue)] hover:bg-[var(--surface-rail)]",
        ghost:
          "text-[var(--muted)] hover:bg-[var(--surface-rail)] hover:text-[var(--ink)]",
        nav:
          "border border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--surface-rail)] hover:text-[var(--ink)]",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
