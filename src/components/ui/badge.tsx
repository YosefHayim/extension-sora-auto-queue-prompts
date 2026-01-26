import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import {
  LuClock,
  LuLoader,
  LuCheck,
  LuX,
  LuVideo,
  LuImage,
} from "react-icons/lu";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 gap-1",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border border-border",
        pending: "bg-muted text-muted-foreground",
        processing: "bg-blue-500 text-white",
        completed: "bg-success text-success-foreground",
        failed: "bg-destructive text-destructive-foreground",
        video: "border border-border bg-transparent text-muted-foreground",
        image: "border border-border bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const statusIcons = {
  pending: LuClock,
  processing: LuLoader,
  completed: LuCheck,
  failed: LuX,
  video: LuVideo,
  image: LuImage,
} as const;

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showIcon?: boolean;
}

function Badge({
  className,
  variant,
  showIcon = false,
  children,
  ...props
}: BadgeProps) {
  const IconComponent =
    variant && statusIcons[variant as keyof typeof statusIcons];

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {showIcon && IconComponent && (
        <IconComponent
          className={cn("h-3 w-3", variant === "processing" && "animate-spin")}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
