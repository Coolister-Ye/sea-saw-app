import * as React from "react";
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Pressable,
  Platform,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils";
import { Text } from "../text";
import { EyeIcon, EyeSlashIcon, XCircleIcon } from "react-native-heroicons/outline";

// Input 容器样式变体
const inputContainerVariants = cva(
  "flex flex-row items-center web:transition-all web:duration-200",
  {
    variants: {
      variant: {
        outlined: "border border-border rounded-md bg-background",
        filled: "border border-transparent rounded-md bg-fill-quaternary",
        borderless: "border-0 bg-transparent",
      },
      size: {
        large: "h-10 px-3 native:h-12 native:px-4",
        middle: "h-8 px-3 native:h-10 native:px-3",
        small: "h-6 px-2 native:h-8 native:px-2",
      },
      status: {
        default: "",
        error: "",
        warning: "",
      },
      disabled: {
        true: "opacity-50 bg-fill-quaternary",
        false: "",
      },
      focused: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // outlined focus states
      {
        variant: "outlined",
        focused: true,
        status: "default",
        className: "border-primary",
      },
      {
        variant: "outlined",
        focused: false,
        status: "default",
        className: "hover:border-primary",
      },
      // filled focus states
      {
        variant: "filled",
        focused: true,
        status: "default",
        className: "border-primary bg-background",
      },
      // error status
      {
        status: "error",
        className: "border-error",
      },
      {
        status: "error",
        focused: true,
        className: "border-error",
      },
      // warning status
      {
        status: "warning",
        className: "border-warning",
      },
      {
        status: "warning",
        focused: true,
        className: "border-warning",
      },
    ],
    defaultVariants: {
      variant: "outlined",
      size: "middle",
      status: "default",
      disabled: false,
      focused: false,
    },
  }
);

// Input 文本样式变体
const inputTextVariants = cva("flex-1 web:outline-none", {
  variants: {
    size: {
      large: "text-base native:text-lg",
      middle: "text-sm native:text-base",
      small: "text-xs native:text-sm",
    },
    disabled: {
      true: "text-text-disabled",
      false: "text-foreground",
    },
  },
  defaultVariants: {
    size: "middle",
    disabled: false,
  },
});

// Addon 样式变体
const addonVariants = cva(
  "flex items-center justify-center bg-fill-quaternary border-border",
  {
    variants: {
      position: {
        before: "border-r rounded-l-md",
        after: "border-l rounded-r-md",
      },
      size: {
        large: "px-3 h-10 native:h-12",
        middle: "px-3 h-8 native:h-10",
        small: "px-2 h-6 native:h-8",
      },
    },
    defaultVariants: {
      size: "middle",
    },
  }
);

type InputVariant = "outlined" | "filled" | "borderless";
type InputSize = "large" | "middle" | "small";
type InputStatus = "error" | "warning";

type BaseInputProps = Omit<RNTextInputProps, "editable"> & {
  /** 输入框变体样式 */
  variant?: InputVariant;
  /** 输入框尺寸 */
  size?: InputSize;
  /** 输入框状态 */
  status?: InputStatus;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readOnly?: boolean;
  /** 前缀图标 */
  prefix?: React.ReactNode;
  /** 后缀图标 */
  suffix?: React.ReactNode;
  /** 前置标签 */
  addonBefore?: React.ReactNode;
  /** 后置标签 */
  addonAfter?: React.ReactNode;
  /** 允许清除内容 */
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  /** 值改变回调 */
  onChangeText?: (text: string) => void;
  /** 容器样式类名 */
  containerClassName?: string;
  /** 输入框样式类名 */
  inputClassName?: string;
};

type InputProps = BaseInputProps;

const Input = React.forwardRef<RNTextInput, InputProps>(
  (
    {
      variant = "outlined",
      size = "middle",
      status,
      disabled = false,
      readOnly = false,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      allowClear = false,
      value,
      onChangeText,
      containerClassName,
      inputClassName,
      className,
      placeholderTextColor,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    const inputRef = React.useRef<RNTextInput>(null);

    // 合并 ref
    React.useImperativeHandle(ref, () => inputRef.current as RNTextInput);

    // 同步外部 value
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChangeText = (text: string) => {
      if (value === undefined) {
        setInternalValue(text);
      }
      onChangeText?.(text);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue("");
      }
      onChangeText?.("");
      inputRef.current?.focus();
    };

    const showClear =
      allowClear && internalValue && internalValue.length > 0 && !disabled && !readOnly;

    // 渲染清除按钮
    const renderClearButton = () => {
      if (!showClear) return null;

      const clearIcon =
        typeof allowClear === "object" && allowClear.clearIcon ? (
          allowClear.clearIcon
        ) : (
          <XCircleIcon size={16} color="#999" />
        );

      return (
        <Pressable onPress={handleClear} className="ml-1 p-1">
          {clearIcon}
        </Pressable>
      );
    };

    const containerClass = cn(
      inputContainerVariants({
        variant,
        size,
        status: status || "default",
        disabled,
        focused,
      }),
      // 如果有 addon，调整圆角
      addonBefore && "rounded-l-none",
      addonAfter && "rounded-r-none",
      containerClassName
    );

    const inputClass = cn(
      inputTextVariants({ size, disabled }),
      inputClassName,
      className
    );

    const inputElement = (
      <View className={containerClass}>
        {prefix && <View className="mr-2">{prefix}</View>}
        <RNTextInput
          ref={inputRef}
          value={value !== undefined ? value : internalValue}
          onChangeText={handleChangeText}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          editable={!disabled && !readOnly}
          className={inputClass}
          placeholderTextColor={placeholderTextColor || "#999"}
          {...props}
        />
        {renderClearButton()}
        {suffix && <View className="ml-2">{suffix}</View>}
      </View>
    );

    // 如果有 addon，包裹一层
    if (addonBefore || addonAfter) {
      return (
        <View className="flex flex-row items-stretch">
          {addonBefore && (
            <View
              className={cn(
                addonVariants({ position: "before", size }),
                "border border-border"
              )}
            >
              {typeof addonBefore === "string" ? (
                <Text size="sm">{addonBefore}</Text>
              ) : (
                addonBefore
              )}
            </View>
          )}
          <View className="flex-1">{inputElement}</View>
          {addonAfter && (
            <View
              className={cn(
                addonVariants({ position: "after", size }),
                "border border-border"
              )}
            >
              {typeof addonAfter === "string" ? (
                <Text size="sm">{addonAfter}</Text>
              ) : (
                addonAfter
              )}
            </View>
          )}
        </View>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";

// Password Input
type PasswordProps = Omit<InputProps, "secureTextEntry"> & {
  /** 是否显示切换密码可见按钮 */
  visibilityToggle?: boolean | { visible?: boolean; onVisibleChange?: (visible: boolean) => void };
  /** 自定义图标渲染 */
  iconRender?: (visible: boolean) => React.ReactNode;
};

const Password = React.forwardRef<RNTextInput, PasswordProps>(
  (
    {
      visibilityToggle = true,
      iconRender,
      suffix,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);

    const isControlled =
      typeof visibilityToggle === "object" && visibilityToggle.visible !== undefined;
    const isVisible = isControlled
      ? (visibilityToggle as { visible: boolean }).visible
      : visible;

    const handleToggle = () => {
      if (isControlled) {
        (visibilityToggle as { onVisibleChange?: (v: boolean) => void }).onVisibleChange?.(
          !isVisible
        );
      } else {
        setVisible(!isVisible);
      }
    };

    const renderToggleIcon = () => {
      if (!visibilityToggle) return null;

      if (iconRender) {
        return (
          <Pressable onPress={handleToggle} className="p-1">
            {iconRender(isVisible)}
          </Pressable>
        );
      }

      return (
        <Pressable onPress={handleToggle} className="p-1">
          {isVisible ? (
            <EyeIcon size={18} color="#999" />
          ) : (
            <EyeSlashIcon size={18} color="#999" />
          )}
        </Pressable>
      );
    };

    return (
      <Input
        ref={ref}
        secureTextEntry={!isVisible}
        suffix={
          <>
            {renderToggleIcon()}
            {suffix}
          </>
        }
        {...props}
      />
    );
  }
);

Password.displayName = "Input.Password";

// TextArea
type TextAreaProps = Omit<InputProps, "prefix" | "suffix" | "addonBefore" | "addonAfter" | "size"> & {
  /** 是否自适应内容高度 */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  /** 是否显示字数统计 */
  showCount?: boolean | { formatter?: (info: { value: string; count: number; maxLength?: number }) => React.ReactNode };
  /** 最大行数（与 autoSize 配合使用） */
  rows?: number;
};

const TextArea = React.forwardRef<RNTextInput, TextAreaProps>(
  (
    {
      autoSize = false,
      showCount = false,
      rows = 4,
      maxLength,
      value,
      onChangeText,
      variant = "outlined",
      status,
      disabled = false,
      readOnly = false,
      allowClear = false,
      containerClassName,
      inputClassName,
      className,
      placeholderTextColor,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    const [height, setHeight] = React.useState<number | undefined>(undefined);
    const inputRef = React.useRef<RNTextInput>(null);

    React.useImperativeHandle(ref, () => inputRef.current as RNTextInput);

    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChangeText = (text: string) => {
      if (value === undefined) {
        setInternalValue(text);
      }
      onChangeText?.(text);
    };

    const handleClear = () => {
      if (value === undefined) {
        setInternalValue("");
      }
      onChangeText?.("");
      inputRef.current?.focus();
    };

    const showClearButton =
      allowClear && internalValue && internalValue.length > 0 && !disabled && !readOnly;

    // 计算行高
    const lineHeight = 20;
    const paddingVertical = 8;
    const minHeight =
      typeof autoSize === "object" && autoSize.minRows
        ? autoSize.minRows * lineHeight + paddingVertical * 2
        : rows * lineHeight + paddingVertical * 2;
    const maxHeight =
      typeof autoSize === "object" && autoSize.maxRows
        ? autoSize.maxRows * lineHeight + paddingVertical * 2
        : undefined;

    const containerClass = cn(
      "flex border rounded-md bg-background p-2",
      variant === "outlined" && "border-border",
      variant === "filled" && "border-transparent bg-fill-quaternary",
      variant === "borderless" && "border-0",
      focused && status !== "error" && status !== "warning" && "border-primary",
      status === "error" && "border-error",
      status === "warning" && "border-warning",
      disabled && "opacity-50 bg-fill-quaternary",
      containerClassName
    );

    const inputClass = cn(
      "text-sm native:text-base text-foreground web:outline-none",
      disabled && "text-text-disabled",
      inputClassName,
      className
    );

    // 渲染字数统计
    const renderCount = () => {
      if (!showCount) return null;

      const count = internalValue?.length || 0;

      if (typeof showCount === "object" && showCount.formatter) {
        return (
          <View className="absolute bottom-1 right-2">
            {showCount.formatter({ value: internalValue || "", count, maxLength })}
          </View>
        );
      }

      return (
        <View className="absolute bottom-1 right-2">
          <Text size="xs" variant="secondary">
            {maxLength ? `${count}/${maxLength}` : count}
          </Text>
        </View>
      );
    };

    return (
      <View className="relative">
        <View className={containerClass}>
          <RNTextInput
            ref={inputRef}
            value={value !== undefined ? value : internalValue}
            onChangeText={handleChangeText}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            onContentSizeChange={
              autoSize
                ? (e) => {
                    const newHeight = e.nativeEvent.contentSize.height;
                    if (maxHeight && newHeight > maxHeight) {
                      setHeight(maxHeight);
                    } else if (newHeight < minHeight) {
                      setHeight(minHeight);
                    } else {
                      setHeight(newHeight);
                    }
                  }
                : undefined
            }
            editable={!disabled && !readOnly}
            multiline
            textAlignVertical="top"
            maxLength={maxLength}
            className={inputClass}
            placeholderTextColor={placeholderTextColor || "#999"}
            style={[
              { minHeight, maxHeight },
              autoSize && height ? { height } : {},
              props.style,
            ]}
            {...props}
          />
          {showClearButton && (
            <Pressable onPress={handleClear} className="absolute top-2 right-2">
              <XCircleIcon size={16} color="#999" />
            </Pressable>
          )}
        </View>
        {renderCount()}
      </View>
    );
  }
);

TextArea.displayName = "Input.TextArea";

// 组合导出
const InputCompound = Object.assign(Input, {
  Password,
  TextArea,
});

export { InputCompound as Input, Password, TextArea, inputContainerVariants, inputTextVariants };
export type { InputProps, PasswordProps, TextAreaProps, InputVariant, InputSize, InputStatus };
