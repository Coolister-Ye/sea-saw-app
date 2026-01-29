import { constants } from "@/constants/Constants";
import { getLocalData, setLocalData } from "./storage";
import { AuthError } from "@/types/auth";

// Re-export AuthError for backward compatibility
export { AuthError };

/* =========================
 * Types
 * ========================= */

type ApiUrlKeys = keyof typeof constants.api;

export type UserToken = {
  access: string;
  refresh: string;
};

type FetchJsonDataProps = {
  url: string;
  method?: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  autoRefresh?: boolean;
  retry?: number;
  isUseToken?: boolean;
};

/* =========================
 * Constants
 * ========================= */

export const USER_TOKEN_KEY = "user_token";
const ERROR_NAME = "FetchError";
const RETRY_COUNT = 1;

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/* =========================
 * Error
 * ========================= */

export class FetchError extends Error {
  url: string;
  status: number;
  statusText: string;
  body?: unknown;

  constructor(
    message: string,
    url: string,
    status: number,
    statusText: string,
    body?: unknown
  ) {
    super(message);
    this.name = ERROR_NAME;
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

/* =========================
 * Token helpers
 * ========================= */

export const getJwtHeader = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

async function getAuthHeader(isUseToken: boolean) {
  if (!isUseToken) return {};
  const token = await getLocalData<UserToken>(USER_TOKEN_KEY);
  return token?.access ? getJwtHeader(token.access) : {};
}

/**
 * refresh token 并发锁
 */
let refreshPromise: Promise<UserToken> | null = null;

async function refreshTokenOnce(): Promise<UserToken> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const tokenData = await getLocalData<UserToken>(USER_TOKEN_KEY);
      if (!tokenData?.refresh) {
        throw new Error("No refresh token");
      }

      const newToken = await fetchJson<UserToken>({
        url: getUrl("tokenRefresh"),
        method: "POST",
        body: { refresh: tokenData.refresh },
        autoRefresh: false,
      });

      await setLocalData(USER_TOKEN_KEY, newToken);
      return newToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/* =========================
 * Utils
 * ========================= */

async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  }
  return await response.text();
}

/* =========================
 * Main fetch
 * ========================= */

export async function fetchJson<T>(props: FetchJsonDataProps): Promise<T> {
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

  const isFormData = body instanceof FormData;
  const authHeader = await getAuthHeader(isUseToken);

  const mergedHeaders = isFormData
    ? authHeader
    : { ...DEFAULT_HEADERS, ...authHeader, ...headers };

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new FetchError("Network connection error", url, 0, error.message);
    }
    throw error;
  }

  /* ---------- Success ---------- */

  if (response.ok) {
    if (response.status === 204) {
      return null as T;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    return null as T;
  }

  /* ---------- 401 auto refresh ---------- */

  if (
    response.status === 401 &&
    autoRefresh &&
    retry > 0 &&
    !url.includes(getUrl("login")) &&
    !url.includes(getUrl("tokenRefresh"))
  ) {
    try {
      const newToken = await refreshTokenOnce();
      return await fetchJson<T>({
        ...props,
        headers: {
          ...headers,
          ...getJwtHeader(newToken.access),
        },
        autoRefresh: false,
        retry: retry - 1,
      });
    } catch (err) {
      throw new AuthError(
        "Token refresh failed",
        url,
        401,
        "Unauthorized",
        err
      );
    }
  }

  /* ---------- Other errors ---------- */

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

/* =========================
 * URL helpers
 * ========================= */

export function getBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL || "";
}

export function getUrl(urlKey: ApiUrlKeys): string {
  const baseUrl = getBaseUrl();
  const apiUrl = constants.api[urlKey];
  if (!apiUrl) {
    throw new Error(`API path for '${urlKey}' is not defined.`);
  }
  return `${baseUrl}${apiUrl}`;
}
