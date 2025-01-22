import { fetchJsonData, getJwtHeader, getUrl } from "@/utlis/webHelper";
import {
  getLocalData,
  setLocalData,
  removeLocalData,
} from "@/utlis/storageHelper";

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

class AuthService {
  // 登录
  static async login(
    username: string,
    password: string
  ): Promise<{ status: boolean }> {
    const url = getUrl("login");

    try {
      const data = await fetchJsonData({
        url,
        method: "POST",
        body: { username, password },
      });

      // 存储 token，直接存储对象
      await setLocalData("userToken", JSON.stringify(data)); // Ensure data is stringified

      return { status: true };
    } catch (error) {
      throw new AuthError(
        `Login failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // 获取用户资料
  static async getUserProfile(): Promise<any> {
    const url = getUrl("userProfile");
    const token = await AuthService.getJwtToken();

    try {
      return await fetchJsonData({
        url,
        method: "GET",
        header: getJwtHeader(token),
      });
    } catch (error) {
      throw new Error(
        `Failed to get user profile: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // 获取 JWT Token
  static async getJwtToken(): Promise<string> {
    const token = await getLocalData("userToken");

    if (!token) {
      throw new AuthError("You have not logged in yet.");
    }

    let parsedToken: UserToken;
    try {
      parsedToken = JSON.parse(token);
    } catch (error) {
      throw new AuthError("Invalid token data or token data broken.");
    }

    try {
      // 验证 token 是否有效
      await fetchJsonData({
        url: getUrl("tokenVerify"),
        method: "POST",
        body: { token: parsedToken.access },
      });
      return parsedToken.access; // 返回有效的 JWT
    } catch (error) {
      throw new AuthError(
        `Token verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // 刷新 JWT Token
  static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const refreshResponse = await fetchJsonData({
        url: getUrl("tokenRefresh"),
        method: "POST",
        body: { refresh: refreshToken },
      });

      // 刷新后存储新的 token
      await setLocalData("userToken", JSON.stringify(refreshResponse)); // Store as string
      return refreshResponse.access;
    } catch (error) {
      throw new AuthError(
        `Token refresh failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // 登出
  static async logout(): Promise<{ status: boolean }> {
    try {
      // 清除本地存储中的 token
      await removeLocalData("userToken");

      console.log("Logged out successfully.");
      return { status: true };
    } catch (error) {
      throw new Error(
        `Logout failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export { AuthError, AuthService };
