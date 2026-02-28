import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

export type PresetColor =
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "cyan"
  | "blue"
  | "purple"
  | "pink"
  | "grey";

export type Variant = "filled" | "outlined" | "solid";

/** Semantic DOM slots (mirrors Ant Design's classNames/styles API) */
export type SemanticDOM = "root" | "label" | "closeBtn";

export interface TagProps {
  color?: PresetColor;
  /** @default "filled" */
  variant?: Variant;
  icon?: React.ReactNode;
  closable?: boolean;
  /** Setting to null or false hides the close button (Ant Design 5.7.0+) */
  closeIcon?: React.ReactNode | null | false;
  onClose?: () => void;
  disabled?: boolean;
  /** Customize className for each semantic slot */
  classNames?: Partial<Record<SemanticDOM, string>>;
  /** Customize inline style for each semantic slot */
  styles?: {
    root?: StyleProp<ViewStyle>;
    label?: StyleProp<TextStyle>;
    closeBtn?: StyleProp<ViewStyle>;
  };
  // CheckableTag API
  checkable?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}
