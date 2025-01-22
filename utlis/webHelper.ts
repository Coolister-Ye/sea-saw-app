import { constants } from "@/constants/Constants";

// 定义环境变量类型
type ENV_NAME = "prod" | "localhost"; // 表示支持的环境类型

// 定义 API 路径的键类型
type ApiUrlKeys = keyof typeof constants.api; // 获取 constants.api 中定义的所有 API 路径键的类型

// 自定义 FetchError 错误类
const ERROR_NAME = "FetchError";

// 定义一个自定义错误类 FetchError，用于包装 API 请求中的错误信息
export class FetchError extends Error {
  url: string; // 请求的 URL
  status: number; // HTTP 响应状态码
  statusText: string; // HTTP 响应状态文本
  body: any; // 错误响应体

  constructor(
    message: any, // 错误信息
    url: string, // 请求的 URL
    status: number, // HTTP 状态码
    statusText: string // HTTP 状态文本
  ) {
    super(message);
    this.name = ERROR_NAME; // 设置错误名为 FetchError
    this.url = url; // 保存 URL
    this.status = status; // 保存状态码
    this.statusText = statusText; // 保存状态文本
  }
}

// 请求参数类型定义
type FetchJsonDataProps = {
  url: string; // 请求的 URL
  method?: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS"; // HTTP 方法
  body?: object; // 请求体（可选）
  header?: Record<string, string>; // 请求头（可选）
};

// 常用请求头常量，设置请求体类型为 JSON
const HEADERS = {
  "Content-Type": "application/json",
};

// 合并请求头，优先使用外部传入的 header
// 将默认请求头与外部传入的 header 合并，确保请求的标准性
const mergeHeaders = (
  header: Record<string, string> = {}
): Record<string, string> => ({
  ...HEADERS,
  ...header, // 如果传入了 header，则合并覆盖默认的请求头
});

// 异步请求处理函数
export const fetchJsonData = async ({
  url,
  method = "GET",
  body,
  header = {},
}: FetchJsonDataProps): Promise<any> => {
  const headers = mergeHeaders(header); // 合并请求头

  try {
    const response = await fetch(url, {
      method, // 请求方法
      headers, // 请求头
      body: body ? JSON.stringify(body) : undefined, // 如果有请求体，转为 JSON 字符串
    });

    // 处理响应失败情况
    if (!response.ok) {
      const errorText = await response.text(); // 获取响应文本

      // 抛出 FetchError 错误并传递相关信息
      throw new FetchError(
        errorText || "Request failed", // 错误信息
        url, // 请求的 URL
        response.status, // HTTP 状态码
        response.statusText // HTTP 状态文本
      );
    }

    // 处理 JSON 响应
    const contentType = response.headers.get("content-type"); // 获取响应的内容类型
    if (contentType && contentType.includes("application/json")) {
      return await response.json(); // 如果响应类型是 JSON，解析并返回
    }

    // 如果响应类型不是 JSON，返回 null
    return null;
  } catch (error) {
    // 捕获并抛出错误
    throw error;
  }
};

// 获取基础 API 域名
// 根据当前环境获取 API 基础 URL
export function getBaseUrl(): string {
  const envName = (process.env.EXPO_PUBLIC_ENV_NAME || "prod") as ENV_NAME;
  return constants[envName]?.apiDomain || ""; // 防止找不到 apiDomain 的情况，返回空字符串
}

// 根据 urlKey 获取完整的 API URL
// 根据传入的 URL 键（例如 "listUsers"）获取完整的 API 路径
export function getUrl(urlKey: string): string {
  const baseUrl = getBaseUrl(); // 获取基础 URL
  const apiUrl = constants.api[urlKey as ApiUrlKeys]; // 获取具体的 API 路径

  if (!apiUrl) {
    throw new Error(`API path for '${urlKey}' is not defined.`); // 如果未定义该 API 路径，抛出错误
  }

  return `${baseUrl}${apiUrl}`; // 返回完整的 API URL
}

// 获取 Bearer Token 请求头
// 根据传入的 Token 获取包含 Authorization 的请求头
export const getJwtHeader = (token: string) => ({
  Authorization: `Bearer ${token}`, // 设置 Authorization 字段为 Bearer token
});
