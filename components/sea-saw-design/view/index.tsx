import * as Slot from "@rn-primitives/slot";
import type { SlottableViewProps, ViewRef } from "@rn-primitives/types";
import * as React from "react";
import { View as RNView } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const viewVariants = cva("", {
  variants: {
    variant: {
      default: "",
      bg: "bg-background dark:bg-dark-background",
      paper: "bg-background-paper dark:bg-dark-background-paper",
      card: "bg-card dark:bg-dark-card",
      muted: "bg-muted dark:bg-dark-muted",
    },
    padding: {
      none: "",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    },
    rounded: {
      none: "",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    },
    border: {
      none: "",
      default: "border border-border dark:border-dark-border",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
    rounded: "none",
    border: "none",
  },
});

type ViewProps = SlottableViewProps & VariantProps<typeof viewVariants>;

const View = React.forwardRef<ViewRef, ViewProps>(
  (
    { className, asChild = false, variant, padding, rounded, border, ...props },
    ref
  ) => {
    const Component = asChild ? Slot.View : RNView;
    return (
      <Component
        className={cn(
          viewVariants({ variant, padding, rounded, border }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

View.displayName = "View";

export { View, viewVariants };
export type { ViewProps };
