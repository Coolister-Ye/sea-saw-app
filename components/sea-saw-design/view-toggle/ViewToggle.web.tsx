import React from "react";
import type { ViewToggleOption } from "./ViewToggle";

interface ViewToggleProps<T extends string = string> {
  options: ViewToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "pill" | "minimal";
}

export function ViewToggle<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  variant = "default",
}: ViewToggleProps<T>) {
  // Size configurations
  const sizeStyles = {
    sm: {
      container: "p-0.5 gap-0.5",
      button: "px-2.5 py-1 gap-1 min-w-[60px]",
      icon: "text-xs",
      text: "text-[10px]",
    },
    md: {
      container: "p-0.5 gap-0.5",
      button: "px-3 py-1.5 gap-1.5 min-w-[80px]",
      icon: "text-sm",
      text: "text-xs",
    },
    lg: {
      container: "p-1 gap-1",
      button: "px-4 py-2 gap-2 min-w-[100px]",
      icon: "text-base",
      text: "text-sm",
    },
  };

  // Variant styles with enhanced CSS transitions
  const variantClasses = {
    default: {
      container:
        "bg-gradient-to-br from-slate-50 to-slate-100/80 rounded-lg border border-slate-200/60 shadow-sm backdrop-blur-sm",
      activeButton:
        "bg-white shadow-md border border-slate-200/80 shadow-slate-200/50 scale-100",
      inactiveButton: "bg-transparent hover:bg-white/40",
      activeIcon: "text-blue-500",
      inactiveIcon: "text-slate-400",
      activeText: "text-blue-600 font-semibold",
      inactiveText: "text-slate-500 font-medium",
    },
    pill: {
      container:
        "bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 rounded-full border border-blue-100 shadow-sm",
      activeButton:
        "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-200/50 scale-105",
      inactiveButton: "bg-transparent hover:bg-white/50",
      activeIcon: "text-white drop-shadow-sm",
      inactiveIcon: "text-slate-500",
      activeText: "text-white font-bold drop-shadow-sm",
      inactiveText: "text-slate-600 font-medium",
    },
    minimal: {
      container: "bg-transparent rounded-lg border-0 gap-1",
      activeButton: "bg-slate-100 border-0",
      inactiveButton: "bg-transparent hover:bg-slate-50",
      activeIcon: "text-slate-900",
      inactiveIcon: "text-slate-300",
      activeText: "text-slate-900 font-semibold",
      inactiveText: "text-slate-400 font-normal",
    },
  };

  const sizeClass = sizeStyles[size];
  const variantClass = variantClasses[variant];

  return (
    <div
      className={`inline-flex flex-row ${variantClass.container} ${sizeClass.container}`}
      style={{
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              flex flex-row items-center justify-center rounded-md
              ${sizeClass.button}
              ${isActive ? variantClass.activeButton : variantClass.inactiveButton}
              transition-all duration-300 ease-out
              cursor-pointer
              ${!isActive && "hover:scale-[1.02]"}
            `}
            style={{
              transform: isActive ? "scale(1)" : "scale(0.98)",
            }}
          >
            {option.icon && (
              <span
                className={`
                  ${sizeClass.icon}
                  ${isActive ? variantClass.activeIcon : variantClass.inactiveIcon}
                  transition-colors duration-300
                `}
              >
                {option.icon}
              </span>
            )}
            <span
              className={`
                ${sizeClass.text}
                ${isActive ? variantClass.activeText : variantClass.inactiveText}
                transition-all duration-300
                whitespace-nowrap
              `}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Re-export the type for convenience
export type { ViewToggleOption };
