/** @type {import("tailwindcss").Config} */
const colors = require("tailwindcss/colors");

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
        // Light mode colors
        primary: {
          DEFAULT: colors.indigo[600],
          light: "#42a5f5",
          dark: "#1565c0",
          contrastText: "#fff",
        },
        secondary: {
          DEFAULT: "#9c27b0",
          light: "#ba68c8",
          dark: "#7b1fa2",
          contrastText: "#fff",
        },
        error: {
          DEFAULT: colors.red[500],
          light: colors.red[300],
          dark: colors.red[700],
          contrastText: "#fff",
        },
        warning: {
          DEFAULT: "#ed6c02",
          light: "#ff9800",
          dark: "#e65100",
          contrastText: "#fff",
        },
        info: {
          DEFAULT: "#0288d1",
          light: "#03a9f4",
          dark: "#01579b",
          contrastText: "#fff",
        },
        success: {
          DEFAULT: "#2e7d32",
          light: "#4caf50",
          dark: "#1b5e20",
          contrastText: "#fff",
        },
        background: {
          DEFAULT: "#fff",
          paper: "#fff",
        },
        text: {
          primary: "rgba(0, 0, 0, 0.87)",
          secondary: "rgba(0, 0, 0, 0.6)",
          disabled: "rgba(0, 0, 0, 0.38)",
          divider: "rgba(0, 0, 0, 0.12)",
          error: colors.red[500],
          success: colors.green[500],
        },

        // Dark mode colors
        dark: {
          primary: {
            DEFAULT: "#90caf9",
            light: "#e3f2fd",
            dark: "#42a5f5",
            contrastText: "#000",
          },
          secondary: {
            DEFAULT: "#ce93d8",
            light: "#f3e5f5",
            dark: "#ba68c8",
            contrastText: "#000",
          },
          error: {
            DEFAULT: "#ef5350",
            light: "#e57373",
            dark: "#d32f2f",
            contrastText: "#000",
          },
          warning: {
            DEFAULT: "#ffb74d",
            light: "#ffe0b2",
            dark: "#ffa726",
            contrastText: "#000",
          },
          info: {
            DEFAULT: "#29b6f6",
            light: "#81d4fa",
            dark: "#0288d1",
            contrastText: "#000",
          },
          success: {
            DEFAULT: "#66bb6a",
            light: "#81c784",
            dark: "#388e3c",
            contrastText: "#000",
          },
          background: {
            DEFAULT: "#121212",
            paper: "#424242",
          },
          text: {
            primary: "#fff",
            secondary: "rgba(255, 255, 255, 0.7)",
            disabled: "rgba(255, 255, 255, 0.5)",
            divider: "rgba(255, 255, 255, 0.12)",
            error: colors.red[500],
            success: colors.green[500],
          },
        },
      },
    },
  },
  plugins: [],
};
