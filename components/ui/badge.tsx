import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[6px] border px-2.5 py-1 text-xs font-black leading-none",
  {
    variants: {
      variant: {
        default:
          "border-[color-mix(in_srgb,var(--plate-yellow)_54%,var(--line))] bg-[color-mix(in_srgb,var(--plate-yellow)_24%,white)] text-[var(--ink)]",
        steel:
          "border-[color-mix(in_srgb,var(--steel-blue)_44%,var(--line))] bg-[color-mix(in_srgb,var(--steel-blue)_13%,white)] text-[var(--steel-blue)]",
        dark: "border-white/10 bg-white/10 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
