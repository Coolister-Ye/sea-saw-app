import { fetchJson, getUrl } from "@/utlis/webHelper";
import { capitalizeString, changeToPlural } from "@/utlis/commonUtils";
import { constants } from "@/constants/Constants";

// Base request configuration
export interface RequestConfig {
  uri: string;
  method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS";
  body?: object;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  suffix?: string;
  signal?: AbortSignal;
}

// API-specific request parameters
export interface ViewsetRequestParams extends Partial<RequestConfig> {
  contentType: string;
  action?: string;
  id?: any;
}

class DataService {
  // Validate if action exists in constants.api
  private static validateApiAction(action: string): void {
    if (!(action in constants.api)) {
      throw new Error(`Invalid API action: ${action}`);
    }
  }

  // Construct URL from action, contentType, id, and params
  private static constructUrl({
    contentType,
    action = "",
    id,
    params,
    suffix = "",
  }: Omit<ViewsetRequestParams, "method" | "headers" | "body">): string {
    const constructedUrl = `${action}${changeToPlural(
      capitalizeString(contentType)
    )}`;
    this.validateApiAction(constructedUrl);

    const baseUrl = getUrl(constructedUrl as keyof typeof constants.api);
    const urlWithId = id ? baseUrl.replace("{id}", id) : baseUrl;
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    return `${urlWithId}${suffix}${queryString}`;
  }

  // Generic request method for any custom API calls
  static async genericRequest({
    uri,
    method,
    body,
    params,
    headers,
    suffix = "",
    signal,
  }: RequestConfig) {
    const baseApiUrl = this.checkAndGetUrl(uri);
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const url = `${baseApiUrl}${suffix}${queryString}`;

    return fetchJson({ url, method, body, headers, signal });
  }

  // Main request handler for viewset-based requests
  static async viewsetRequest({
    method,
    contentType,
    action = "",
    id,
    body,
    params,
    headers,
    suffix = "",
  }: ViewsetRequestParams) {
    const url = this.constructUrl({ contentType, action, id, params, suffix });
    return fetchJson({ url, method, body, headers });
  }

  // Validate if URI exists in constants.api
  private static checkAndGetUrl(uri: string): string {
    this.validateApiAction(uri);
    return getUrl(uri as keyof typeof constants.api);
  }

  // ====== Simplified CRUD Operations ======

  static listView(params: Omit<ViewsetRequestParams, "method" | "action">) {
    return this.viewsetRequest({
      ...params,
      method: "GET",
      action: "list",
    });
  }

  static createView(params: Omit<ViewsetRequestParams, "method" | "action">) {
    return this.viewsetRequest({
      ...params,
      method: "POST",
      action: "create",
    });
  }

  static updateView(params: Omit<ViewsetRequestParams, "method" | "action">) {
    return this.viewsetRequest({
      ...params,
      method: "PATCH",
      action: "update",
    });
  }

  static deleteView(params: Omit<ViewsetRequestParams, "method" | "action">) {
    return this.viewsetRequest({
      ...params,
      method: "DELETE",
      action: "delete",
    });
  }

  static optionView(params: Omit<ViewsetRequestParams, "method" | "action">) {
    return this.viewsetRequest({
      ...params,
      method: "OPTIONS",
      action: "list",
    });
  }
}

export { DataService };
