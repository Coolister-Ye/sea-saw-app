import * as React from "react";
import { Pressable, ActivityIndicator } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { TextClassContext, Text } from "../text";

const buttonVariants = cva(
  "group flex rounded-md items-center justify-center font-semibold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary dark:bg-dark-primary",
        destructive: "bg-destructive",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
        secondary: "bg-secondary dark:bg-dark-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent underline-offset-4 text-primary hover:underline",
        "primary.light": "bg-primary-light dark:bg-dark-primary-light",
        "primary.dark": "bg-primary-dark dark:bg-dark-primary-dark",
        "secondary.light": "bg-secondary-light dark:bg-dark-secondary-light",
        "secondary.dark": "bg-secondary-dark dark:bg-dark-secondary-dark",
        success: "bg-success dark:bg-dark-success",
        "success.light": "bg-success-light dark:bg-dark-success-light",
        "success.dark": "bg-success-dark dark:bg-dark-success-dark",
        error: "bg-error dark:bg-dark-error",
        "error.light": "bg-error-light dark:bg-dark-error-light",
        "error.dark": "bg-error-dark dark:bg-dark-error-dark",
      },
      size: {
        default: "h-10 px-4 py-2 native:h-12 native:px-5 native:py-3",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 native:h-14",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap text-sm native:text-base font-medium web:transition-colors",
  {
    variants: {
      variant: {
        default:
          "text-primary-contrastText dark:text-dark-primary-contrastText",
        destructive: "text-destructive-contrastText",
        outline: "text-accent-contrastText",
        secondary:
          "text-secondary-contrastText dark:text-dark-primary-contrastText",
        ghost: "text-accent-contrastText",
        link: "text-primary group-active:contrastText",
        "primary.light": "text-primary-contrastText",
        "primary.dark": "text-primary-contrastText",
        "secondary.light": "text-secondary-contrastText",
        "secondary.dark": "text-secondary-contrastText",
        success: "text-success-contrastText",
        "success.light": "text-success-contrastText",
        "success.dark": "text-success-contrastText",
        error: "text-error-contrastText",
        "error.light": "text-error-contrastText",
        "error.dark": "text-error-contrastText",
      },
      size: {
        default: "",
        sm: "",
        lg: "native:text-lg",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    children?: React.ReactNode;
    textClassName?: string;
  };

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    { className, variant, size, loading, children, textClassName, ...props },
    ref
  ) => {
    const buttonClass = React.useMemo(
      () =>
        cn(
          loading && "opacity-50 web:pointer-events-none",
          buttonVariants({ variant, size, className })
        ),
      [variant, size, className, loading]
    );

    const textClass = React.useMemo(
      () => buttonTextVariants({ variant, size, className: textClassName }),
      [variant, size]
    );

    return (
      <TextClassContext.Provider value={textClass}>
        <Pressable
          ref={ref}
          role="button"
          className={buttonClass}
          disabled={loading || props.disabled}
          {...props}
        >
          {loading ? (
            <ActivityIndicator
              color={variant?.includes("dark") ? "#000" : "#fff"}
            />
          ) : typeof children === "string" ? (
            <Text>{children}</Text>
          ) : (
            children
          )}
        </Pressable>
      </TextClassContext.Provider>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps };
