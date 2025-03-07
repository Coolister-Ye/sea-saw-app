import { constants } from "@/constants/Constants";
import { getLocalData, setLocalData } from "./storageHelper";

// Define API URL keys type from constants
type ApiUrlKeys = keyof typeof constants.api;
type UserToken = { access: string; refresh: string };

export const USER_TOKEN_KEY = "user_token";
const ERROR_NAME = "FetchError";
const RETRY_COUNT = 1;

export class FetchError extends Error {
  url: string;
  status: number;
  statusText: string;
  body: any;

  constructor(
    message: string,
    url: string,
    status: number,
    statusText: string,
    body?: any
  ) {
    super(message);
    this.name = ERROR_NAME;
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

// Request parameter type definition
type FetchJsonDataProps = {
  url: string;
  method?: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS";
  body?: unknown; // Allow any JSON-serializable value
  headers?: Record<string, string>;
  signal?: AbortSignal; // Optional AbortSignal for request cancellation
  autoRefresh?: boolean; // Optional flag to enable auto-refresh for jwt token
  retry?: number; // Optional retry count
  isUseToken?: boolean; // Optional flag to use jwt token
};

// Default request headers with JSON content-type
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// Merge default headers with user-provided headers
const mergeHeaders = async (
  headers: Record<string, string> = {},
  isUseToken: boolean = true
): Promise<Record<string, string>> => {
  let authHeader: Record<string, string> = {};

  if (isUseToken) {
    const tokenData = await getLocalData<{ access: string }>(USER_TOKEN_KEY);
    if (tokenData) {
      try {
        const { access } = tokenData;
        authHeader = getJwtHeader(access);
      } catch (error) {
        console.warn("Invalid token format");
      }
    }
  }

  return {
    ...DEFAULT_HEADERS,
    ...authHeader,
    ...headers,
  };
};

// 辅助函数：解析响应错误体
async function parseErrorBody(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }
  return await response.text();
}

export const fetchJson = async <T>(props: FetchJsonDataProps): Promise<T> => {
  const {
    url,
    method = "GET",
    body,
    headers = {},
    signal,
    autoRefresh = true,
    retry = RETRY_COUNT,
    isUseToken = true,
  } = props;

  const mergedHeaders = await mergeHeaders(headers, isUseToken);
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    // 网络错误处理（如断网或 DNS 问题）
    if (error instanceof TypeError) {
      throw new FetchError("Network connection error", url, 0, error.message);
    }
    throw error;
  }

  // 提取 contentType 供后续使用
  const contentType = response.headers.get("content-type");

  // 自动刷新 token 的逻辑
  if (!response.ok) {
    if (
      response.status === 401 &&
      autoRefresh &&
      retry > 0 &&
      // 避免对登录和 token 刷新接口进行自动刷新
      !url.includes(getUrl("login")) &&
      !url.includes(getUrl("tokenRefresh"))
    ) {
      try {
        const tokenData = await getLocalData(USER_TOKEN_KEY);
        if (tokenData) {
          const parsedToken: UserToken = JSON.parse(tokenData);
          // 刷新 token（禁用自动刷新并递减重试次数）
          const newTokenData = await fetchJson<UserToken>({
            url: getUrl("tokenRefresh"),
            method: "POST",
            body: { refresh: parsedToken.refresh },
            autoRefresh: false,
            retry: retry - 1,
          });
          // 更新本地存储中的 token 数据
          await setLocalData(USER_TOKEN_KEY, JSON.stringify(newTokenData));
          // 更新请求头，注入新的 Authorization
          const newHeaders = {
            ...headers,
            ...getJwtHeader(newTokenData.access),
          };
          // 重新发起原始请求（此时禁用自动刷新）
          return await fetchJson<T>({
            ...props,
            headers: newHeaders,
            autoRefresh: false,
          });
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        throw new FetchError(
          "Token refresh failed: " +
            (refreshError instanceof Error
              ? refreshError.message
              : "Unknown error"),
          url,
          401,
          "Unauthorized",
          refreshError
        );
      }
    }

    // 解析错误响应体
    const errorBody = await parseErrorBody(response);
    throw new FetchError(
      typeof errorBody === "string"
        ? errorBody
        : JSON.stringify(errorBody) || "Request failed",
      url,
      response.status,
      response.statusText,
      errorBody
    );
  }
  // 成功响应：解析 JSON 数据
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return null as unknown as T;
};

// Get the base API URL from environment variables
export function getBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL || "";
}

// Get the full API URL by key, ensuring type-safety
export function getUrl(urlKey: ApiUrlKeys): string {
  const baseUrl = getBaseUrl();
  const apiUrl = constants.api[urlKey];
  if (!apiUrl) {
    throw new Error(`API path for '${urlKey}' is not defined.`);
  }
  return `${baseUrl}${apiUrl}`;
}

// Get Bearer Token headers for authorization
export const getJwtHeader = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});
