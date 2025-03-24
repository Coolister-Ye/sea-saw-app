import { useRef, useState } from "react";
import TextInput, { TextInputProps } from "../themed/TextInput";
import { TextInput as BaseTextInput, View } from "react-native";
import {
  NativeSyntheticEvent,
  NativeTouchEvent,
  Platform,
  Pressable,
  TextInputFocusEventData,
} from "react-native";
import React from "react";
import clsx from "clsx";

export type DropdownProps = TextInputProps & {
  suffixIcon?: React.ReactNode;
  dropdownClassName?: string
};

//   // Need to been used with ScrollView when this component is used in IOS/Android.
//   // Because onBlur can only be triggered in web when clicking outside.
//   // A workaround would be wrapping all the TextInput components inside ScrollView.

//   // <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
//   //  <TextInput onBlur={() => console.log("blur")} />
//   // </ScrollView>

const Dropdown = React.forwardRef<BaseTextInput, DropdownProps>(
  ({ onPress, onBlur, className, dropdownClassName, children, suffixIcon, onPressOutside, ...rest }, ref) => {
    const [isHidden, setHidden] = useState(true);
    const innerRef = useRef<any>(ref);
    const dropdownContainerClassName = clsx(
      "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm",
      dropdownClassName
    );
    const suffixConatinerClassName =
      "pointer-events-none absolute inset-y-0 right-0 flex pr-2 justify-center";

    const _onPress = (event: NativeSyntheticEvent<NativeTouchEvent>) => {
      onPress && onPress(event);
      setHidden(false);
    };

    // This workaround is workable about it would cause inconsistent behavior
    // const _onBlur = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    //   console.log("onblur");
    //   setTimeout(() => {
    //     onBlur && onBlur(event);
    //     setHidden(true);
    //   }, 500); 
    // };

    const onClick = () => setHidden(false);

    return (
      <View className={clsx(className, "w-full relative")}>
        {/* Pass the forwarded ref to the TextInput component */}
        <View className="w-full relative flex-row justify-center">
          <TextInput
            {...rest}
            onPress={_onPress}
            onPressOutside={() => setHidden(true)}
            ref={ref}
            {...(Platform.OS === "web" && { onClick })}
          />
          {suffixIcon && (
            <View className={suffixConatinerClassName}>{suffixIcon}</View>
          )}
        </View>

        {/* Dropdown content container */}
        <View className="relative">
          {!isHidden && (
            <Pressable
              className={dropdownContainerClassName}
              onPress={() => {
                (innerRef as any).current?.focus();
                setHidden(true);
              }}
            >
              {children}
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

export default Dropdown;
