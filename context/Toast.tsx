import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast from "@/components/themed/Toast"; // 假设你的 Toast 组件在这个文件中

// Toast Context 类型定义
type ToastContextType = {
  showToast: (
    message: string,
    variant?: "success" | "error" | "warning",
    info?: string[],
    duration?: number
  ) => void;
};

// 创建 Toast Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ToastProvider 组件，提供 Toast 上下文
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toastData, setToastData] = useState<{
    message: string | null;
    variant: "success" | "error" | "warning";
    info: string[];
    duration: number;
  }>({
    message: null,
    variant: "error",
    info: [],
    duration: 3000,
  });

  const showToast = (
    message: string,
    variant: "success" | "error" | "warning" = "error",
    info: string[] = [],
    duration: number = 3000
  ) => {
    setToastData({ message, variant, info, duration });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastData.message && (
        <Toast
          message={toastData.message}
          variant={toastData.variant}
          info={toastData.info}
          duration={toastData.duration}
          onClose={() =>
            setToastData({
              message: null,
              variant: "error",
              info: [],
              duration: 3000,
            })
          }
        />
      )}
    </ToastContext.Provider>
  );
};

// 使用 ToastContext
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
