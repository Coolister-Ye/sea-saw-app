/**
 * Authentication Service
 *
 * Handles JWT token management and authentication operations:
 * - Login/Logout
 * - Token refresh and verification
 * - User profile fetching
 * - Password management
 *
 * This service is framework-agnostic and can be used outside of React context.
 */

import { fetchJson, getUrl, getLocalData, setLocalData, removeLocalData } from "@/utils";
import { devLog, devWarn, devError } from "@/utils/logger";
import { AuthError } from "@/types/auth";
import type {
  UserToken,
  UserProfile,
  RegisterData,
  ProfileUpdateData,
  RegisterResponse,
  ProfileUpdateResponse,
} from "@/types/auth";

// Re-export for backward compatibility
export { AuthError };
export type { UserToken, UserProfile };

// ==================== Service ====================

export class AuthService {
  private static readonly TOKEN_STORAGE_KEY = "user_token";

  // ==================== Public Methods ====================

  /**
   * Authenticate user with username and password
   * @throws {AuthError} If authentication fails
   */
  static async login(username: string, password: string): Promise<void> {
    try {
      const tokenData = await fetchJson<UserToken>({
        url: getUrl("login"),
        method: "POST",
        body: { username, password },
        autoRefresh: false,
        isUseToken: false,
      });

      await this.saveToken(tokenData);
      devLog("Login successful for user:", username);
    } catch (error) {
      devError("Login failed:", error);
      throw this.createAuthError("Login failed", error);
    }
  }

  /**
   * Log out current user by clearing stored tokens
   * @throws {AuthError} If logout fails
   */
  static async logout(): Promise<void> {
    try {
      await removeLocalData(this.TOKEN_STORAGE_KEY);
      devLog("Logout successful");
    } catch (error) {
      devError("Logout failed:", error);
      throw this.createAuthError("Logout failed", error);
    }
  }

  /**
   * Get current user's profile information
   * @throws {AuthError} If profile fetch fails or user is not authenticated
   */
  static async getUserProfile(): Promise<UserProfile> {
    try {
      const profile = await fetchJson<UserProfile>({
        url: getUrl("userProfile"),
        method: "GET",
      });
      devLog("Fetched user profile:", profile.username);
      return profile;
    } catch (error) {
      devError("Failed to fetch user profile:", error);
      throw this.createAuthError("Failed to fetch user profile", error);
    }
  }

  /**
   * Change user's password
   * @throws {AuthError} If password change fails
   */
  static async setPassword(newPassword: string, currentPassword: string): Promise<void> {
    try {
      await fetchJson({
        url: getUrl("setPasswd"),
        method: "POST",
        body: {
          new_password: newPassword,
          current_password: currentPassword,
        },
      });
      devLog("Password changed successfully");
    } catch (error) {
      devError("Password change failed:", error);
      throw this.createAuthError("Password change failed", error);
    }
  }

  /**
   * Register a new user account
   * @throws {AuthError} If registration fails
   */
  static async register(data: RegisterData): Promise<UserProfile> {
    try {
      const response = await fetchJson<RegisterResponse>({
        url: getUrl("register"),
        method: "POST",
        body: data,
        autoRefresh: false,
        isUseToken: false,
      });
      devLog("User registered successfully:", response.user.username);
      return response.user;
    } catch (error) {
      devError("Registration failed:", error);
      throw this.createAuthError("Registration failed", error);
    }
  }

  /**
   * Update current user's profile
   * @throws {AuthError} If profile update fails or user is not authenticated
   */
  static async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await fetchJson<ProfileUpdateResponse>({
        url: getUrl("profileUpdate"),
        method: "PATCH",
        body: data,
      });
      devLog("Profile updated successfully");
      return response.user;
    } catch (error) {
      devError("Profile update failed:", error);
      throw this.createAuthError("Profile update failed", error);
    }
  }

  /**
   * Get valid JWT access token (auto-refreshes if needed)
   * @throws {AuthError} If token retrieval fails or user is not authenticated
   */
  static async getJwtToken(): Promise<string> {
    const tokenData = await this.loadToken();

    try {
      // Try to verify current access token
      await this.verifyToken(tokenData.access);
      return tokenData.access;
    } catch (error) {
      // Access token expired or invalid, try to refresh
      devWarn("Access token invalid, attempting refresh...");
      return await this.refreshToken(tokenData.refresh);
    }
  }

  /**
   * Check if user is currently logged in (has valid tokens)
   * @returns true if user has valid tokens, false otherwise
   */
  static async isLoggedIn(): Promise<boolean> {
    try {
      await this.getJwtToken();
      return true;
    } catch (error) {
      devWarn("Login check failed:", error instanceof AuthError ? error.message : error);
      return false;
    }
  }

  /**
   * Check if user has a stored token (doesn't verify validity)
   * @returns true if token exists in storage
   */
  static async hasStoredToken(): Promise<boolean> {
    try {
      const tokenData = await getLocalData<UserToken>(this.TOKEN_STORAGE_KEY);
      return Boolean(tokenData);
    } catch {
      return false;
    }
  }

  /**
   * Clear all stored authentication data
   * Same as logout() but doesn't throw on errors
   */
  static async clearAuthData(): Promise<void> {
    await this.logout();
  }

  // ==================== Private Methods ====================

  /**
   * Refresh access token using refresh token
   * @throws {AuthError} If refresh fails
   */
  private static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const newToken = await fetchJson<UserToken>({
        url: getUrl("tokenRefresh"),
        method: "POST",
        body: { refresh: refreshToken },
        autoRefresh: false,
        isUseToken: false,
      });

      await this.saveToken(newToken);
      devLog("Token refreshed successfully");
      return newToken.access;
    } catch (error) {
      devError("Token refresh failed:", error);
      throw this.createAuthError("Token refresh failed", error);
    }
  }

  /**
   * Verify if access token is valid
   * @throws {AuthError} If token is invalid
   */
  private static async verifyToken(token: string): Promise<void> {
    try {
      await fetchJson({
        url: getUrl("tokenVerify"),
        method: "POST",
        body: { token },
        autoRefresh: false,
        isUseToken: false,
      });
    } catch (error) {
      throw this.createAuthError("Token verification failed", error);
    }
  }

  /**
   * Save token to secure storage
   */
  private static async saveToken(token: UserToken): Promise<void> {
    try {
      await setLocalData(this.TOKEN_STORAGE_KEY, JSON.stringify(token));
    } catch (error) {
      devError("Failed to save token:", error);
      throw this.createAuthError("Failed to save authentication token", error);
    }
  }

  /**
   * Load token from secure storage
   * @throws {AuthError} If token doesn't exist or is corrupted
   */
  private static async loadToken(): Promise<UserToken> {
    try {
      const tokenData = await getLocalData<UserToken>(this.TOKEN_STORAGE_KEY);

      if (!tokenData) {
        throw new AuthError("No authentication token found. Please log in.");
      }

      // Validate token structure
      if (!tokenData.access || !tokenData.refresh) {
        throw new AuthError("Invalid token structure. Please log in again.");
      }

      return tokenData;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      devError("Failed to load token:", error);
      throw this.createAuthError("Failed to load authentication token", error);
    }
  }

  /**
   * Create a standardized AuthError with context
   */
  private static createAuthError(message: string, error: unknown): AuthError {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new AuthError(`${message}: ${errorMessage}`, error);
  }
}

// ==================== Deprecated Aliases ====================
// For backward compatibility - to be removed in future versions

/**
 * @deprecated Use `AuthService.isLoggedIn()` instead
 */
export const isLogin = AuthService.isLoggedIn.bind(AuthService);
