import * as Slot from "@rn-primitives/slot";
import type { SlottableTextProps, TextRef } from "@rn-primitives/types";
import * as React from "react";
import { Text as RNText } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

const textVariants = cva("web:select-text", {
  variants: {
    variant: {
      default: "text-foreground",
      primary: "text-text-primary dark:text-dark-text-primary",
      secondary: "text-text-secondary dark:text-dark-text-secondary",
      disabled: "text-text-disabled dark:text-dark-text-disabled",
      divider: "text-text-divider dark:text-dark-text-divider",
      error: "text-text-error dark:text-dark-text-error",
      muted: "text-muted-foreground",
      link: "text-primary underline-offset-4",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "base",
    weight: "normal",
  },
});

type TextProps = SlottableTextProps & VariantProps<typeof textVariants>;

const Text = React.forwardRef<TextRef, TextProps>(
  (
    { className, asChild = false, variant, size, weight, align, ...props },
    ref
  ) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    return (
      <Component
        className={cn(
          textVariants({ variant, size, weight, align }),
          textClass,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, TextClassContext, textVariants };
export type { TextProps };
