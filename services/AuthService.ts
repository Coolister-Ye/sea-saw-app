import { fetchJson, getUrl } from "@/utils";
import {
  getLocalData,
  setLocalData,
  removeLocalData,
} from "@/utils";

// 自定义认证错误
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

interface UserToken {
  access: string;
  refresh: string;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
}

class AuthService {
  private static USER_TOKEN_KEY = "user_token";

  // 登录
  static async login(
    username: string,
    password: string
  ): Promise<{ status: boolean }> {
    try {
      const tokenData = await fetchJson<UserToken>({
        url: getUrl("login"),
        method: "POST",
        body: { username, password },
        autoRefresh: false,
        isUseToken: false,
      });

      this.saveToken(tokenData);

      return { status: true };
    } catch (error) {
      throw this.handleAuthError("Login failed", error);
    }
  }

  // 获取 JWT Token
  static async getJwtToken(): Promise<string> {
    const tokenData = await this.loadToken();

    try {
      await this.verifyToken(tokenData.access);
      return tokenData.access;
    } catch {
      return await this.refreshToken(tokenData.refresh);
    }
  }

  // 刷新 JWT Token
  private static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const newToken = await fetchJson<UserToken>({
        url: getUrl("tokenRefresh"),
        method: "POST",
        body: { refresh: refreshToken },
      });

      this.saveToken(newToken);
      return newToken.access;
    } catch (error) {
      throw new AuthError(
        `Token refresh failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // 检查是否已登录
  static async isLogin(): Promise<boolean> {
    try {
      await this.getJwtToken();
      return true;
    } catch (error) {
      console.warn("Login status check failed:");
      return false;
    }
  }

  // 获取用户资料
  static async getUserProfile(): Promise<UserProfile> {
    try {
      return await fetchJson<UserProfile>({
        url: getUrl("userProfile"),
        method: "GET",
      });
    } catch (error) {
      throw this.handleAuthError("Failed to fetch user profile", error);
    }
  }

  // 登出
  static async logout(): Promise<{ status: boolean }> {
    try {
      await removeLocalData(this.USER_TOKEN_KEY);
      console.info("Logged out successfully.");
      return { status: true };
    } catch (error) {
      throw this.handleAuthError("Logout failed", error);
    }
  }

  // 修改密码
  static async setPassword(
    newPassword: string,
    currentPassword: string
  ): Promise<{ status: boolean }> {
    try {
      await fetchJson({
        url: getUrl("setPasswd"),
        method: "POST",
        body: {
          new_password: newPassword,
          current_password: currentPassword,
        },
      });
      return { status: true };
    } catch (error) {
      throw this.handleAuthError("Password change failed", error);
    }
  }

  // 保存 token
  private static async saveToken(token: UserToken): Promise<void> {
    await setLocalData(this.USER_TOKEN_KEY, JSON.stringify(token));
  }

  // 加载 token
  private static async loadToken(): Promise<UserToken> {
    const tokenData = await getLocalData<{ access: string }>(
      this.USER_TOKEN_KEY
    );
    if (!tokenData) {
      throw new AuthError("You are not logged in.");
    }

    try {
      return tokenData as UserToken;
    } catch {
      throw new AuthError("Invalid or corrupted token data.");
    }
  }

  // 验证 token
  private static async verifyToken(token: string): Promise<void> {
    await fetchJson({
      url: getUrl("tokenVerify"),
      method: "POST",
      body: { token },
    });
  }

  // 统一处理错误
  private static handleAuthError(message: string, error: unknown): AuthError {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new AuthError(`${message}: ${errorMessage}`);
  }
}

export { AuthError, AuthService };
