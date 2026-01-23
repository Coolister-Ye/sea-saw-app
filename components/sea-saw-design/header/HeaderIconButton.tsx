import { forwardRef } from "react";
import { Pressable, View } from "react-native";
import type { PressableProps } from "react-native";

type HeaderIconButtonProps = {
  children: React.ReactNode;
  variant?: "default" | "ghost";
} & Omit<PressableProps, "children">;

/**
 * Reusable icon button for header actions with consistent styling
 */
export const HeaderIconButton = forwardRef<View, HeaderIconButtonProps>(
  ({ children, variant = "default", className, ...props }, ref) => {
    const baseStyles =
      "p-2 rounded-lg items-center justify-center transition-colors";

    const variantStyles = {
      default:
        "bg-transparent hover:bg-secondary active:bg-muted",
      ghost:
        "bg-transparent hover:bg-transparent active:bg-transparent",
    };

    return (
      <Pressable
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);

HeaderIconButton.displayName = "HeaderIconButton";
