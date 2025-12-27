import React, { ReactNode, useState } from "react";
import { Drawer as AntdDrawer, DrawerProps as AntdDrawerProps } from "antd";

interface DrawerProps extends AntdDrawerProps {
  children: ReactNode;
}

export default function Drawer({ children, size = 900, ...rest }: DrawerProps) {
  const [drawerSize, setDrawerSize] = useState(size);
  return (
    <AntdDrawer
      closable={{ "aria-label": "Close Button", placement: "end" }}
      size={drawerSize}
      resizable={{
        onResize: (newSize) => setDrawerSize(newSize),
      }}
      {...rest}
    >
      {children}
    </AntdDrawer>
  );
}

export { Drawer };
