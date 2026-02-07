import React, { useState, useCallback, useEffect } from "react";
import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from "antd";
import { DrawerProps } from "./types";

/**
 * Web 平台 Drawer 属性（扩展 Antd 的额外属性）
 */
interface WebDrawerProps
  extends Omit<DrawerProps, "width">,
    Omit<AntdDrawerProps, keyof DrawerProps | "width" | "resizable"> {
  /** Drawer 宽度（Web 使用 number） */
  width?: number;
  /** 默认宽度（非受控） */
  defaultWidth?: number;
}

export default function Drawer({
  children,
  width,
  defaultWidth = 900,
  resizable = true,
  onResize,
  size,
  closable = true,
  placement = "right",
  mask = true,
  maskClosable = true,
  ...rest
}: WebDrawerProps) {
  // 支持受控和非受控两种模式
  // 如果提供了 width prop，则为受控模式
  // 如果只提供了 defaultWidth，则为非受控模式
  const isControlled = width !== undefined;
  const [internalWidth, setInternalWidth] = useState<number>(
    width ?? defaultWidth
  );

  // 受控模式：同步外部 width 到内部状态
  useEffect(() => {
    if (isControlled && width !== undefined) {
      setInternalWidth(width);
    }
  }, [isControlled, width]);

  // 优化：使用 useCallback 避免不必要的重新渲染
  // Antd 的 onResize 接收 number 而不是对象
  const handleResize = useCallback(
    (newWidth: number) => {
      if (isControlled) {
        // 受控模式：通知父组件更新
        onResize?.(newWidth);
      } else {
        // 非受控模式：更新内部状态
        setInternalWidth(newWidth);
        onResize?.(newWidth);
      }
    },
    [isControlled, onResize]
  );

  // 最终使用的宽度值
  const finalWidth = isControlled ? width : internalWidth;

  // 处理 Antd 的 size
  // size 接受 number | 'default' | 'large'
  // 优先使用 size（如果提供），否则使用 finalWidth
  const drawerSize = size ?? finalWidth;

  // 构建 resizable 配置
  const resizableConfig = resizable
    ? {
        onResize: handleResize,
      }
    : undefined;

  return (
    <AntdDrawer
      closable={closable}
      size={drawerSize}
      placement={placement}
      mask={mask}
      maskClosable={maskClosable}
      resizable={resizableConfig}
      styles={{
        header: { paddingBottom: 16 },
        body: { paddingTop: 16 },
      }}
      {...rest}
    >
      {children}
    </AntdDrawer>
  );
}

export { Drawer };
export type { DrawerProps };
