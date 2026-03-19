import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";

/** Ant Design preset colors */
export type PresetColor =
  | "magenta"
  | "red"
  | "volcano"
  | "orange"
  | "gold"
  | "yellow"
  | "lime"
  | "green"
  | "cyan"
  | "blue"
  | "geekblue"
  | "purple"
  | "pink";

/** Ant Design status colors */
export type StatusColor =
  | "success"
  | "processing"
  | "error"
  | "warning"
  | "default";

/** All recognized named colors */
export type NamedColor = PresetColor | StatusColor;

export interface TagProps {
  /**
   * Color of tag. Accepts:
   * - preset name (e.g. "blue", "green")
   * - status name (e.g. "success", "processing")
   * - custom CSS color / hex string → solid colored background, white text
   */
  color?: NamedColor | (string & {});
  /** Whether to show border. @default true */
  bordered?: boolean;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /**
   * Custom close icon. Set to `false` or `null` to hide the close button.
   * Set to `true` to show the default close icon.
   * @default undefined (controlled by `closable`)
   */
  closeIcon?: React.ReactNode | boolean | null;
  /** Whether the tag is closable. Ignored when `closeIcon` is a node. */
  closable?: boolean;
  /** Called when the close button is pressed */
  onClose?: () => void;
  /** Called when the tag is pressed */
  onPress?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export interface CheckableTagProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}
