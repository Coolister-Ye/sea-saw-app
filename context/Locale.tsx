import i18n from "@/locale/i18n"; // 引入 i18n 配置文件
import { getLocalData, setLocalData } from "@/utlis/storageHelper"; // 引入本地存储操作工具
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// 定义 Context 的类型，包含 locale、i18n 实例和切换语言的方法
interface LocaleContextType {
  locale: string; // 当前语言
  i18n: typeof i18n; // i18n 实例
  changeLocale: (newLocale: string) => void; // 切换语言的方法
}

// 创建 LocaleContext，初始值为 null
const LocaleContext = createContext<LocaleContextType | null>(null);

// 定义 LocaleProvider 的 props 类型
interface LocaleProviderProps {
  children: ReactNode; // 子组件
}

// LocaleProvider 组件：为整个应用提供语言上下文
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
  // 定义 locale 状态，默认值为 i18n 的当前语言
  const [locale, setLocaleState] = useState<string>(i18n.locale);

  // 组件加载时，尝试从本地存储加载已保存的语言
  useEffect(() => {
    const loadLocale = async () => {
      try {
        const savedLocale = await getLocalData("appLocale"); // 从本地存储获取语言
        if (savedLocale) {
          i18n.locale = savedLocale; // 更新 i18n 的语言
          setLocaleState(savedLocale); // 更新 React 状态
        }
      } catch (error) {
        console.error("Error loading locale from storage:", error);
      }
    };
    loadLocale(); // 执行加载语言的函数
  }, []); // 只在组件挂载时执行一次

  // 切换语言并保存到本地存储
  const changeLocale = async (newLocale: string) => {
    i18n.locale = newLocale; // 更新 i18n 的语言
    setLocaleState(newLocale); // 更新 React 状态
    try {
      await setLocalData("appLocale", newLocale); // 保存语言到本地存储
    } catch (error) {
      console.error("Error saving locale to storage:", error);
    }
  };

  // 提供 locale、i18n 和 changeLocale 方法给子组件
  return (
    <LocaleContext.Provider
      value={{
        locale,
        i18n,
        changeLocale,
      }}
    >
      {children} {/* 渲染子组件 */}
    </LocaleContext.Provider>
  );
};

// 自定义 hook，方便组件访问 LocaleContext
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext); // 获取 context
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context; // 返回 context 的值
};
