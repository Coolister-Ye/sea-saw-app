import clsx from "clsx";
import { Text as BaseText, TextProps as BeseTextProps } from "react-native";

type TextProps = BeseTextProps & {
  variant?: "primary" | "secondary" | "disable" | "divider" | "error";
};

// When variant is undifined, text component degerentate into base text component
export default function Text({ className, variant, ...rest }: TextProps) {
  const _className = clsx(
    variant === "primary" && "text-text-primary dark:text-dark-text-primary",
    variant === "secondary" &&
      "text-text-secondary dark:text-dark-text-secondary",
    variant === "disable" && "text-text-disabled dark:text-dark-text-disabled",
    variant === "divider" && "text-text-divider dark:text-dark-text-divider",
    variant === "error" && "text-text-error dark:text-dark-text-error",
    className
  );
  return <BaseText className={_className} {...rest} />;
}
