import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600",
        info: "bg-blue-500 text-white hover:bg-blue-600",
      },
      size: {
        default: "h-6",
        sm: "h-5 text-[10px]",
        lg: "h-8 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export function Badge({
  className,
  variant,
  size,
  startIcon,
  endIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {startIcon && <span className="mr-1 -ml-0.5">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1 -mr-0.5">{endIcon}</span>}
    </div>
  );
}

// For convenience, export named variants as well
export const DefaultBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="default" {...props} />
);

export const SecondaryBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="secondary" {...props} />
);

export const DestructiveBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="destructive" {...props} />
);

export const OutlineBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="outline" {...props} />
);

export const SuccessBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="success" {...props} />
);

export const WarningBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="warning" {...props} />
);

export const InfoBadge = (props: Omit<BadgeProps, "variant">) => (
  <Badge variant="info" {...props} />
);