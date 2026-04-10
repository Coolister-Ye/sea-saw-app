import * as Slot from "@rn-primitives/slot";
import type { SlottableTextProps, TextRef } from "@rn-primitives/types";
import * as React from "react";
import { Text as RNText } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

/**
 * Text color variants aligned with Ant Design 5.x colorText scale.
 *
 * Uses Tailwind opacity modifiers (text-foreground/<opacity>) instead of
 * separate CSS variables, so the color adapts correctly to any background
 * — exactly how antd implements rgba(0,0,0,0.xx) tokens.
 *
 *   default   → rgba(text, 1.00)  antd: colorText
 *   secondary → rgba(text, 0.65)  antd: colorTextSecondary
 *   tertiary  → rgba(text, 0.45)  antd: colorTextTertiary  (caption, placeholder)
 *   disabled  → rgba(text, 0.25)  antd: colorTextDisabled
 *   success / warning / danger    semantic color variants
 *   link                          primary brand color
 */
const textVariants = cva("web:select-text", {
  variants: {
    variant: {
      default:   "text-foreground",
      secondary: "text-foreground/65",
      tertiary:  "text-foreground/45",
      disabled:  "text-foreground/25",
      success:   "text-success",
      warning:   "text-warning",
      danger:    "text-error",
      link:      "text-primary underline-offset-4",
      // ── legacy aliases ──
      primary:   "text-foreground",         // → default
      muted:     "text-foreground/45",      // → tertiary
      error:     "text-error",              // → danger
    },
    size: {
      xs:   "text-xs",
      sm:   "text-sm",
      base: "text-base",
      lg:   "text-lg",
      xl:   "text-xl",
      "2xl": "text-2xl",
    },
    weight: {
      normal:   "font-normal",
      medium:   "font-medium",
      semibold: "font-semibold",
      bold:     "font-bold",
    },
    align: {
      left:   "text-left",
      center: "text-center",
      right:  "text-right",
    },
  },
  defaultVariants: {
    variant: "default",
    size:    "base",
    weight:  "normal",
  },
});

type TextProps = SlottableTextProps &
  VariantProps<typeof textVariants> & {
    /** Italic style */
    italic?: boolean;
    /** Underline decoration */
    underline?: boolean;
    /** Strikethrough decoration (antd: delete) */
    strikethrough?: boolean;
    /** Highlight text with a yellow mark background (antd: mark) */
    mark?: boolean;
    /** Inline code style — monospace font + muted background (antd: code) */
    code?: boolean;
    /** Truncate to a single line with ellipsis */
    ellipsis?: boolean;
  };

const Text = React.forwardRef<TextRef, TextProps>(
  (
    {
      className,
      asChild = false,
      variant,
      size,
      weight,
      align,
      italic,
      underline,
      strikethrough,
      mark,
      code,
      ellipsis,
      ...props
    },
    ref
  ) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;

    return (
      <Component
        className={cn(
          textVariants({ variant, size, weight, align }),
          textClass,
          italic        && "italic",
          underline     && "underline underline-offset-2",
          strikethrough && "line-through",
          mark          && "bg-yellow-100 dark:bg-yellow-900/50 rounded-sm px-0.5",
          code          && "font-mono bg-muted rounded px-1 text-xs",
          ellipsis      && "web:truncate",
          className
        )}
        {...(ellipsis ? { numberOfLines: 1 } : {})}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, TextClassContext, textVariants };
export type { TextProps };
