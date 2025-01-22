import clsx from "clsx";
import {
  TextInput as BaseTextInput,
  TextInputProps as BaseTextInputProps,
  GestureResponderEvent,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Platform,
} from "react-native";
import React, { useImperativeHandle, useRef } from "react";
import useOutside from "@/hooks/useOutside";

export type TextInputProps = BaseTextInputProps & {
  variant?: "primary" | "secondary" | "disable";
  onClick?: any;
  onPressOutside?: any;
};

const TextInput = React.forwardRef<BaseTextInput, TextInputProps>(
  ({ variant = "primary", className, onPress, onClick, onPressOutside, ...props }, ref) => {
    const { outsideEmitter, onOutside } = useOutside();
    const _className = clsx(
      variant === "primary" && "text-text-primary dark:text-dark-text-primary",
      variant === "secondary" && "text-text-secondary dark:text-dark-text-secondary",
      variant === "disable" && "text-text-disabled dark:text-dark-text-disabled",
      "block w-full rounded-md border-0 p-2 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
      className
    );
    const _onClick = (e: any) => {
      onClick && onClick(e);
      outsideEmitter(e);
    };

    // 使用 onOutside 监听外部点击
    // 创建内部 ref && 合并外部传入的 ref 和内部的 _ref
    const _ref = useRef<BaseTextInput | null>(null);
    useImperativeHandle(ref, () => _ref.current as BaseTextInput);

    onOutside(_ref, () => {
      onPressOutside && onPressOutside();
    });

    return (
      <BaseTextInput
        {...props}
        ref={_ref}
        className={_className}
        editable={variant !== "disable"}
        onPress={(e) => {
          onPress && onPress(e);
          outsideEmitter(e);
        }}
        {...(Platform.OS === "web" && { onClick: _onClick })}
      />
    );
  }
);

export default TextInput;
