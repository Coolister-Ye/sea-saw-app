import { clsx } from "clsx";
import { ReactNode } from "react";
import { Text, Pressable, PressableProps } from "react-native";

type ButtonProps = PressableProps & {
  variant:
    | "primary"
    | "secondary"
    | "primary.light"
    | "primary.dark"
    | "secondary.light"
    | "secondary.dark"
    | "success"
    | "success.light"
    | "success.dark"
    | "error"
    | "error.light"
    | "error.dark"
    | "outlined";
    children: ReactNode,
    icon?: ReactNode
};

export default function Button({
  className,
  variant,
  children,
  icon,
  ...rest
}: ButtonProps) {
  const _className = clsx(
    variant === "primary" && "bg-primary dark:bg-dark-primary",
    variant === "secondary" && "bg-secondary dark:bg-dark-primary",
    variant === "primary.light" && "bg-primary-light dark:bg-dark-primary-light",
    variant === "primary.dark" && "bg-primary-dark dark:bg-dark-primary-dark",
    variant === "secondary.light" && "bg-secondary-light dark:bg-dark-secondary-light",
    variant === "secondary.dark" && "bg-secondary-dark dark:bg-dark-secondary-dark",
    variant === "success" && "bg-success dark:bg-dark-success",
    variant === "success.light" && "bg-success-light dark:bg-dark-success-light",
    variant === "success.dark" && "bg-success-dark dark:bg-dark-success-dark",
    variant === "error" && "bg-error && dark:bg-dark-error",
    variant === "error.light" && "bg-error-light dark:bg-dark-error-light",
    variant === "error.dark" && "bg-error-dark dark:bg-dark-error-dark",
    variant === "outlined" && "bg-transparent ring-1 ring-inset ring-gray-300 hover:bg-gray-100",
    "rounded-md items-center justify-center font-semibold",
    "hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
    className
  );
  const _classNameText = clsx(
    variant.startsWith("primary") && "text-primary-contrastText dark:text-dark-primary-contrastText",
    variant.startsWith("secondary") && "text-secondary-contrastText dark:text-dark-primary-contrastText",
    variant.startsWith("success") && "text-success-contrastText dark:text-dark-success-contrastText",
    variant.startsWith("error") && "text-error-contrastText dark:text-dark-error-contrastText",
    className?.split(" ").filter(c => c.startsWith("text") || c.startsWith("font"))
  );
  return <Pressable className={_className} {...rest} >
    {icon}
    <Text className={_classNameText}>{children}</Text>
  </Pressable>
}
