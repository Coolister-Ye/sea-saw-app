import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthService, AuthError } from "@/services/AuthService";
import {
  Href,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import Toast from "@/components/themed/Toast";

// Context类型定义
interface AuthContextType {
  isLogin: boolean;
  user: any;
  loading: boolean;
  error: string | null;
  login: ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  checkLoginStatus: () => void;
  isGroupX: (groupName: string) => boolean;
  isStaff: () => boolean;
  setPasswd: (params: {
    new_password: string;
    current_password: string;
  }) => Promise<any>;
}

// AuthService返回的响应类型
type AuthResponse = {
  status: boolean;
  errorMsg?: string;
};

// 创建AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 用于消费AuthContext的hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider组件的props类型
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider组件
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { next } = useLocalSearchParams<{ next?: string }>();

  // 状态管理
  const [user, setUser] = useState<any | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Utility function to handle redirection logic after login check or login action
  // 用于根据登录状态进行页面跳转的辅助函数
  const handleNavigation = useCallback(() => {
    if (pathname === "/login") {
      // 如果当前在登录页面，则跳转到 'next' 页面或者默认跳转到 '/'
      router.navigate((next as Href) || "/");
    }
  }, [pathname, next, router]);

  // Check if the user is logged in
  // 检查用户是否已登录，并根据需要跳转或设置状态
  const checkLoginStatus = useCallback(async () => {
    try {
      // 尝试获取JWT token，检查是否已登录
      await AuthService.getJwtToken();
      setIsLogin(true); // 如果获取到token，设置登录状态为true
      handleNavigation(); // 登录成功后执行跳转
    } catch (error) {
      setIsLogin(false); // 如果没有token，则设置登录状态为false
      if (error instanceof AuthError) {
        // 处理AuthError类型的错误
        if (pathname !== "/login") {
          router.replace(`/login?next=${pathname}`); // 如果不是登录页，跳转到登录页
          setError(error.message); // 设置错误信息
        }
      } else {
        // 其他未知错误处理
        console.error(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
        setError("An unexpected error occurred.");
      }
    }
  }, [router, pathname, next, handleNavigation]);

  // 更新用户资料的函数
  // 只有在isLogin为true时才去获取用户资料
  const updateUserProfile = useCallback(async () => {
    if (isLogin) {
      try {
        const userProfile = await AuthService.getUserProfile();
        setUser(userProfile); // 设置用户信息
      } catch (error) {
        setUser(null); // 如果获取失败，清空用户信息
        setError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      }
    } else {
      setUser(null); // 如果未登录，清空用户信息
    }
  }, [isLogin]);

  // Login function that authenticates the user and redirects
  // 登录功能，使用AuthService进行认证，并在成功后跳转
  const login = useCallback(
    async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }): Promise<AuthResponse> => {
      setLoading(true); // 设置loading状态
      setError(null); // 清空之前的错误信息

      try {
        const response = await AuthService.login(username, password);
        if (response.status) {
          setIsLogin(true); // 登录成功，设置登录状态
          handleNavigation(); // 登录后进行跳转
        }
        return response; // 返回登录结果
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        setError(errorMessage); // 设置错误信息
        return { status: false, errorMsg: errorMessage }; // 返回错误状态
      } finally {
        setLoading(false); // 无论成功与否，退出loading状态
      }
    },
    [handleNavigation]
  );

  // Logout function to log out the user
  // 登出功能
  const logout = async () => {
    setLoading(true); // 设置loading状态
    try {
      await AuthService.logout();
      setIsLogin(false); // 登出成功，设置登录状态为false
      setUser(null); // 清空用户信息
      router.replace("/login"); // 跳转到登录页
    } catch (error) {
      setError("Logout failed."); // 设置错误信息
    } finally {
      setLoading(false); // 退出loading状态
    }
  };

  // Set new password
  // 修改密码功能
  const setPasswd = async ({ new_password, current_password }: any) => {
    setLoading(true); // Start loading state

    try {
      const response = await AuthService.setPasswd(
        new_password,
        current_password
      );

      setIsLogin(false); // Set login state to false (the user may need to log in again)
      setUser(null); // Clear the user data
      router.replace("/login"); // Redirect to the login page for re-authentication
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage); // Set error message
    } finally {
      setLoading(false); // Exit loading state
    }
  };

  // 检查用户是否属于指定的用户组
  const isGroupX = (groupName: string): boolean => {
    return (
      user &&
      user.groups.some((group: { name: string }) => group.name === groupName)
    );
  };

  // 检查用户是否是管理员
  const isStaff = (): boolean => {
    return user && user.is_staff;
  };

  // 只在组件挂载时检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // 登录状态变化时更新用户资料
  useEffect(() => {
    updateUserProfile();
  }, [isLogin, updateUserProfile]);

  return (
    <>
      <Toast variant="error" message={error} />
      <AuthContext.Provider
        value={{
          isLogin,
          user,
          loading,
          error,
          login,
          logout,
          checkLoginStatus,
          isGroupX,
          isStaff,
          setPasswd,
        }}
      >
        {children}
      </AuthContext.Provider>
    </>
  );
};
