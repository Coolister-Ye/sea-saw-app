import React, { createContext, useContext, useState, ReactNode } from "react";
import { Toast, ToastProps } from "@/components/sea-saw-design/toast";

// Toast Context 类型定义
type ToastContextType = {
  showToast: (props: ToastProps) => void;
};

// 创建 Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ToastProvider 组件
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [currentToast, setCurrentToast] = useState<ToastProps | null>(null);

  // 展示新的 Toast
  const showToast = (props: ToastProps) => {
    const newToast = { ...props, timestamp: Date.now() };
    setCurrentToast(newToast);
  };

  // 清理 Toast
  const handleClose = () => {
    setCurrentToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {currentToast && (
        <Toast
          message={currentToast.message}
          variant={currentToast.variant}
          info={currentToast.info}
          duration={currentToast.duration}
          timestamp={currentToast.timestamp}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
};

// 使用 ToastContext 的自定义 hook
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
