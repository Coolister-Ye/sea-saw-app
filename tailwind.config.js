/** @type {import("tailwindcss").Config} */
const colors = require("tailwindcss/colors");
const { hairlineWidth } = require("nativewind/theme");

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./components/**/**/*.{js,jsx,ts,tsx}",
    "./components/**/**/**/*.{js,jsx,ts,tsx}",
    "./constants/*.{js,jsx,ts,tsx}",
    "./App.tsx",
  ],
  presets: [require("nativewind/preset")],
  // or 'media' for system-preferred dark mode
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ═══════════════════════════════════════════════════════════════════════════
           Ant Design 风格颜色配置
           ═══════════════════════════════════════════════════════════════════════════ */

        /* 基础色 */
        border: "hsl(var(--border))",
        "border-secondary": "hsl(var(--border-secondary))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        divider: "hsl(var(--divider))",

        /* 主色 - Primary */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          active: "hsl(var(--primary-active))",
          bg: "hsl(var(--primary-bg))",
          "bg-hover": "hsl(var(--primary-bg-hover))",
          border: "hsl(var(--primary-border))",
          "border-hover": "hsl(var(--primary-border-hover))",
        },

        /* 成功色 - Success */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          hover: "hsl(var(--success-hover))",
          active: "hsl(var(--success-active))",
          bg: "hsl(var(--success-bg))",
          "bg-hover": "hsl(var(--success-bg-hover))",
          border: "hsl(var(--success-border))",
          "border-hover": "hsl(var(--success-border-hover))",
        },

        /* 警告色 - Warning */
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          hover: "hsl(var(--warning-hover))",
          active: "hsl(var(--warning-active))",
          bg: "hsl(var(--warning-bg))",
          "bg-hover": "hsl(var(--warning-bg-hover))",
          border: "hsl(var(--warning-border))",
          "border-hover": "hsl(var(--warning-border-hover))",
        },

        /* 错误色 - Error */
        error: {
          DEFAULT: "hsl(var(--error))",
          foreground: "hsl(var(--error-foreground))",
          hover: "hsl(var(--error-hover))",
          active: "hsl(var(--error-active))",
          bg: "hsl(var(--error-bg))",
          "bg-hover": "hsl(var(--error-bg-hover))",
          border: "hsl(var(--error-border))",
          "border-hover": "hsl(var(--error-border-hover))",
        },

        /* 信息色 - Info */
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          bg: "hsl(var(--info-bg))",
          border: "hsl(var(--info-border))",
        },

        /* 次要色 - Secondary */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        /* 禁用状态 */
        disabled: {
          DEFAULT: "hsl(var(--disabled))",
          foreground: "hsl(var(--disabled-foreground))",
        },

        /* 中性色 */
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* 图表色 */
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      boxShadow: {
        /* antd 风格阴影 */
        sm: "0 1px 2px 0 hsl(var(--shadow) / 0.03)",
        DEFAULT:
          "0 1px 3px 0 hsl(var(--shadow) / 0.08), 0 1px 2px -1px hsl(var(--shadow) / 0.08)",
        md: "0 4px 6px -1px hsl(var(--shadow) / 0.08), 0 2px 4px -2px hsl(var(--shadow) / 0.08)",
        lg: "0 10px 15px -3px hsl(var(--shadow) / 0.08), 0 4px 6px -4px hsl(var(--shadow) / 0.08)",
        xl: "0 20px 25px -5px hsl(var(--shadow) / 0.08), 0 8px 10px -6px hsl(var(--shadow) / 0.08)",
        "2xl": "0 25px 50px -12px hsl(var(--shadow) / 0.16)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "chip-fade-in": {
          from: { opacity: "0", transform: "scale(0.9) translateY(-2px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "modal-slide-in": {
          from: { opacity: "0", transform: "scale(0.95) translateY(10px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "chip-fade-in": "chip-fade-in 0.2s ease-out",
        "modal-slide-in": "modal-slide-in 0.3s ease-out",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [require("tailwindcss-animate")],
};
