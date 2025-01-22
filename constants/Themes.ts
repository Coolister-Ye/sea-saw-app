// To make it work, add the path of this file into tailwind.config.js

export const Themes = {
  text: {
    default: "text-gray-950 dark:text-gray-100",
    primary: "text-gray-900 text-sm dark:text-white",
    secondary: "text-gray-800 text-xs dark:text-gray-200",
    tiny: "text-gray-800 text-[10px] dark:text-gray-200",
    title: "text-gray-950 text-3xl font-extrabold dark:text-gray-100",
    link: "text-sky-800 text-base",
  },
  view: {
    default: "bg-transparent",
    primary: "bg-white dark:bg-gray-800",
    secondary: "bg-gray-200 dark:bg-gray-700",
  },
  button: {
    primary: "rounded-md border-[1px] p-5 hover:bg-sky-800 px-5 py-2"
  }
};
