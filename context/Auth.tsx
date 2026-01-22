import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { AuthService } from "@/services/AuthService";
import {
  Href,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { useToast } from "./Toast";
import { useAsyncWithLoading } from "@/hooks/useAsyncWithLoading";

// Context 类型定义
interface AuthContextType {
  isLogin: boolean;
  user: any;
  loading: boolean;
  isInitialized: boolean;
  login: (params: {
    username: string;
    password: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isGroupX: (groupName: string) => boolean;
  isStaff: boolean;
  setPasswd: (params: {
    new_password: string;
    current_password: string;
  }) => Promise<void>;
}

interface AuthResponse {
  status: boolean;
  errorMsg?: string;
}

// 创建 AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 用于消费 AuthContext 的 Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider 组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { showToast } = useToast();

  // 状态管理
  const [user, setUser] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 统一错误处理函数
  const handleError = useCallback(
    (error: unknown): void => {
      const errMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      showToast({ message: errMessage });
    },
    [showToast]
  );

  // 获取用户资料
  const { execute: getUserProfile, loading: profileLoading } =
    useAsyncWithLoading(async () => {
      try {
        const userProfile = await AuthService.getUserProfile();
        setUser(userProfile);
      } catch (error) {
        setUser(null);
        handleError(error);
      }
    });

  // 登录
  const { execute: login, loading: loginLoading } = useAsyncWithLoading(
    async ({ username, password }: { username: string; password: string }) => {
      try {
        const response = await AuthService.login(username, password);
        if (response.status) {
          await getUserProfile();
          router.replace((next as Href) || "/");
        }
        return response;
      } catch (error) {
        handleError(error);
        return { status: false };
      }
    }
  );

  // 登出
  const { execute: logout, loading: logoutLoading } = useAsyncWithLoading(
    async () => {
      try {
        await AuthService.logout();
        setUser(null);
        router.replace("/login");
      } catch (error) {
        handleError(error);
      }
    }
  );

  // 修改密码
  const { execute: setPasswd, loading: setPasswdLoading } = useAsyncWithLoading(
    async ({
      new_password,
      current_password,
    }: {
      new_password: string;
      current_password: string;
    }) => {
      try {
        await AuthService.setPassword(new_password, current_password);
        setUser(null);
        router.replace("/login");
      } catch (error) {
        handleError(error);
      }
    }
  );

  // 用户是否属于指定组
  const isGroupX = useCallback(
    (groupName: string): boolean =>
      user?.groups?.some(
        (group: { name: string }) => group.name === groupName
      ) ?? false,
    [user]
  );

  // 是否为管理员
  const isStaff = useMemo(() => user?.is_staff ?? false, [user]);

  // 组件挂载时检查登录状态
  useEffect(() => {
    (async () => {
      try {
        const loggedIn = await AuthService.isLogin();
        if (loggedIn) {
          await getUserProfile();
          if (pathname === "/login") {
            router.replace((next as Href) || "/");
          }
        } else if (pathname !== "/login") {
          router.replace(`/login?next=${pathname}`);
        }
      } catch (error) {
        handleError(error);
      } finally {
        // 无论成功或失败，都标记为已初始化
        setIsInitialized(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLogin: Boolean(user),
        user,
        loading:
          loginLoading || logoutLoading || profileLoading || setPasswdLoading,
        isInitialized,
        login,
        logout,
        isGroupX,
        isStaff,
        setPasswd,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
