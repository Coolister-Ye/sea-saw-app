import clsx from "clsx";
import React from "react";
import { View as BaseView, ViewProps as BaseViewProps } from "react-native";

export type ViewProps = BaseViewProps & {
  variant?: "bg" | "paper";
};

const View = React.forwardRef<BaseView, ViewProps>(
  ({ className, variant, ...rest }: ViewProps, ref) => {
    const _className = clsx(
      variant === "bg" && "bg-background dark:bg-dark-background",
      variant === "paper" &&
        "bg-background-paper dark:bg-dark-background-paper",
      className
    );

    return <BaseView className={_className} ref={ref} {...rest} />;
  }
);

export default View;
