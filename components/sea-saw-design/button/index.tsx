import * as React from "react";
import { Pressable, ActivityIndicator, View } from "react-native";
import { cva } from "class-variance-authority";
import { cn } from "../utils";
import { TextClassContext, Text } from "../text";

// antd 风格的按钮类型
const buttonVariants = cva(
  "group flex flex-row items-center justify-center font-semibold web:transition-all web:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:opacity-80",
  {
    variants: {
      type: {
        primary: "bg-primary hover:bg-primary-hover active:bg-primary-active",
        default: "bg-background border border-border hover:border-primary",
        dashed:
          "bg-background border border-dashed border-border hover:border-primary",
        text: "bg-transparent hover:bg-secondary",
        link: "bg-transparent",
      },
      size: {
        large: "h-10 px-4 py-2 native:h-12 native:px-5 native:py-3",
        middle: "h-8 px-4 py-1 native:h-10 native:px-4 native:py-2",
        small: "h-6 px-2 py-0.5 native:h-8 native:px-3 native:py-1",
      },
      shape: {
        default: "rounded-md",
        circle: "rounded-full aspect-square",
        round: "rounded-full",
      },
      block: {
        true: "w-full",
        false: "",
      },
      danger: {
        true: "",
        false: "",
      },
      ghost: {
        true: "bg-transparent",
        false: "",
      },
    },
    compoundVariants: [
      // danger + primary
      {
        type: "primary",
        danger: true,
        className: "bg-error hover:bg-error-hover active:bg-error-active",
      },
      // danger + default/dashed
      {
        type: "default",
        danger: true,
        className: "border-error hover:border-error-hover",
      },
      {
        type: "dashed",
        danger: true,
        className: "border-error hover:border-error-hover",
      },
      // danger + text
      {
        type: "text",
        danger: true,
        className: "hover:bg-error-bg",
      },
      // ghost 模式
      {
        type: "primary",
        ghost: true,
        className: "bg-transparent border border-primary hover:bg-primary-bg",
      },
      {
        type: "primary",
        ghost: true,
        danger: true,
        className: "bg-transparent border border-error hover:bg-error-bg",
      },
    ],
    defaultVariants: {
      type: "default",
      size: "middle",
      shape: "default",
      block: false,
      danger: false,
      ghost: false,
    },
  }
);

const buttonTextVariants = cva(
  "web:whitespace-nowrap font-medium web:transition-colors",
  {
    variants: {
      type: {
        primary: "text-primary-foreground",
        default: "text-foreground",
        dashed: "text-foreground",
        text: "text-foreground",
        link: "text-primary underline-offset-4 group-active:underline hover:text-primary-hover",
      },
      size: {
        large: "text-base native:text-lg",
        middle: "text-sm native:text-base",
        small: "text-xs native:text-sm",
      },
      danger: {
        true: "",
        false: "",
      },
      ghost: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // danger text colors
      {
        type: "primary",
        danger: true,
        className: "text-error-foreground",
      },
      {
        type: "default",
        danger: true,
        className: "text-error",
      },
      {
        type: "dashed",
        danger: true,
        className: "text-error",
      },
      {
        type: "text",
        danger: true,
        className: "text-error",
      },
      {
        type: "link",
        danger: true,
        className: "text-error hover:text-error-hover",
      },
      // ghost text colors
      {
        type: "primary",
        ghost: true,
        className: "text-primary",
      },
      {
        type: "primary",
        ghost: true,
        danger: true,
        className: "text-error",
      },
    ],
    defaultVariants: {
      type: "default",
      size: "middle",
      danger: false,
      ghost: false,
    },
  }
);

type ButtonType = "primary" | "default" | "dashed" | "text" | "link";
type ButtonSize = "large" | "middle" | "small";
type ButtonShape = "default" | "circle" | "round";

type ButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof Pressable>,
  "children"
> & {
  /** 按钮类型 */
  type?: ButtonType;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 按钮形状 */
  shape?: ButtonShape;
  /** 将按钮宽度调整为其父宽度 */
  block?: boolean;
  /** 设置危险按钮 */
  danger?: boolean;
  /** 幽灵属性，使按钮背景透明 */
  ghost?: boolean;
  /** 设置按钮载入状态 */
  loading?: boolean;
  /** 设置按钮的图标组件 */
  icon?: React.ReactNode;
  /** 设置按钮图标组件的位置 */
  iconPosition?: "start" | "end";
  /** 按钮内容 */
  children?: React.ReactNode;
  /** 自定义文字样式类名 */
  textClassName?: string;
};

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      className,
      type = "default",
      size = "middle",
      shape = "default",
      block = false,
      danger = false,
      ghost = false,
      loading = false,
      icon,
      iconPosition = "start",
      children,
      textClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClass = React.useMemo(
      () =>
        cn(
          buttonVariants({ type, size, shape, block, danger, ghost }),
          isDisabled && "opacity-50 web:cursor-not-allowed",
          className
        ),
      [type, size, shape, block, danger, ghost, isDisabled, className]
    );

    const textClass = React.useMemo(
      () =>
        cn(buttonTextVariants({ type, size, danger, ghost }), textClassName),
      [type, size, danger, ghost, textClassName]
    );

    // 获取 loading 指示器颜色
    const getLoadingColor = () => {
      if (type === "primary" && !ghost) {
        return danger ? "#fff" : "#fff";
      }
      return danger ? "#ff4d4f" : "#1677ff";
    };

    // 渲染图标
    const renderIcon = (position: "start" | "end") => {
      if (loading && position === "start") {
        return (
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
            style={{ marginRight: children ? 8 : 0 }}
          />
        );
      }
      if (icon && iconPosition === position) {
        return (
          <View
            style={{
              marginRight: position === "start" && children ? 8 : 0,
              marginLeft: position === "end" && children ? 8 : 0,
            }}
          >
            {icon}
          </View>
        );
      }
      return null;
    };

    // 渲染内容
    const renderContent = () => {
      if (typeof children === "string") {
        return <Text className={textClass}>{children}</Text>;
      }
      return children;
    };

    return (
      <TextClassContext.Provider value={textClass}>
        <Pressable
          ref={ref}
          role="button"
          className={buttonClass}
          disabled={isDisabled}
          {...props}
        >
          {renderIcon("start")}
          {renderContent()}
          {renderIcon("end")}
        </Pressable>
      </TextClassContext.Provider>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps, ButtonType, ButtonSize, ButtonShape };
