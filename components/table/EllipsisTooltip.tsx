import React, { useState, useRef, useEffect } from "react";
import { Tooltip } from "antd";

// EllipsisTooltip 组件：用于处理超出容器宽度的文本，超出时显示 Tooltip 提示
const EllipsisTooltip: React.FC<{
  title: string; // Tooltip 显示的内容
  children: React.ReactNode; // 容器内的子元素
}> = ({ title, children }) => {
  const [visible, setVisible] = useState(false); // 控制 Tooltip 是否可见
  const containerRef = useRef<HTMLDivElement>(null); // 引用容器元素

  // 使用 useEffect 判断组件挂载时内容是否超出容器宽度
  useEffect(() => {
    // 检查子元素内容是否超出容器宽度
    if (
      containerRef.current &&
      containerRef.current.clientWidth < containerRef.current.scrollWidth
    ) {
      setVisible(true); // 如果超出，显示 Tooltip
    }
  }, [children]); // 当内容变化时重新检查是否需要显示 Tooltip

  return (
    <div ref={containerRef}>
      {visible ? (
        // 如果内容超出，显示 Tooltip
        <Tooltip title={title}>
          <div
            style={
              {
                // textOverflow: "ellipsis", // 超出部分用省略号表示?
                // overflow: "hidden", // 隐藏超出部分
                // whiteSpace: "nowrap", // 防止换行
              }
            }
          >
            {children}
          </div>
        </Tooltip>
      ) : (
        // 如果内容没有超出，直接显示内容
        children
      )}
    </div>
  );
};

export default EllipsisTooltip;
