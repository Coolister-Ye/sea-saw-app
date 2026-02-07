import { ReactNode } from "react";

/**
 * 统一的 Drawer 属性接口
 * 跨平台通用，Native 和 Web 使用相同的接口定义
 */
export interface DrawerProps {
  /** 是否显示 Drawer */
  open: boolean;
  /** 关闭回调（必填） */
  onClose: () => void;
  /** Drawer 内容 */
  children: ReactNode;
  /** Drawer 宽度（支持 number、string、百分比等，使用 any 以兼容不同平台的类型要求） */
  width?: any;
  /** 默认宽度（非受控模式，仅 Web） */
  defaultWidth?: number;
  /** Drawer 标题 */
  title?: string | ReactNode;
  /** Drawer 底部内容 */
  footer?: ReactNode;
  /** 是否显示遮罩 */
  mask?: boolean;
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;
  /** 遮罩透明度（0-1） */
  maskOpacity?: number;
  /** 是否显示关闭按钮 */
  closable?: boolean;
  /** 自定义关闭图标 */
  closeIcon?: ReactNode;
  /** Drawer 方向 */
  placement?: "right" | "left" | "top" | "bottom";
  /** 是否可调整大小（仅 Web 支持） */
  resizable?: boolean;
  /** 调整大小回调（仅 Web 支持） */
  onResize?: (width: number) => void;
}
