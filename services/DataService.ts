import { AuthService } from "./AuthService";
import { fetchJsonData, getJwtHeader, getUrl } from "@/utlis/webHelper";
import { capitalizeString, changeToPlural } from "@/utlis/commonUtils";

class DataService {
  // Helper function to get JWT headers
  static async getHeaders() {
    const token = await AuthService.getJwtToken();
    return getJwtHeader(token);
  }

  // Helper function to construct URL for different API actions
  static constructUrl(
    contentType: string,
    action: string,
    id?: any,
    params?: { [key: string]: string }
  ) {
    const baseUrl = getUrl(
      `${action}${changeToPlural(capitalizeString(contentType))}`
    );
    const urlWithId = id ? baseUrl.replace("{id}", id) : baseUrl;
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return `${urlWithId}${queryString}`;
  }

  static async genericRequest(
    uri: string,
    method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS" | undefined,
    data?: object,
    params?: { [key: string]: string },
    headers?: { [key: string]: string },
    suffix?: string
  ) {
    const commonHeaders = await DataService.getHeaders();
    const baseUrl = getUrl(uri);
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    const url = `${baseUrl}${suffix || ""}${queryString}`;
    return fetchJsonData({
      url,
      method,
      body: data,
      header: { ...commonHeaders, ...headers },
    });
  }

  // General method to handle API requests
  static async request(
    method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS" | undefined,
    contentType: string,
    action: string,
    id?: any,
    data?: object,
    params?: { [key: string]: string },
    headers?: { [key: string]: string }
  ) {
    const commonHeaders = await DataService.getHeaders();
    const url = DataService.constructUrl(contentType, action, id, params);

    return fetchJsonData({
      url,
      method,
      body: data,
      header: { ...commonHeaders, ...headers },
    });
  }

  // Specific methods for API actions
  static listView(
    contentType: string,
    params?: { [key: string]: string },
    headers?: { [key: string]: string }
  ) {
    return DataService.request(
      "GET",
      contentType,
      "list",
      undefined,
      undefined,
      params,
      headers
    );
  }

  static createView(
    contentType: string,
    data: object,
    headers?: { [key: string]: string }
  ) {
    return DataService.request(
      "POST",
      contentType,
      "create",
      undefined,
      data,
      undefined,
      headers
    );
  }

  static updateView(
    id: any,
    contentType: string,
    data: object,
    headers?: { [key: string]: string }
  ) {
    return DataService.request(
      "PATCH",
      contentType,
      "update",
      id,
      data,
      undefined,
      headers
    );
  }

  static deleteView(
    id: any,
    contentType: string,
    headers?: { [key: string]: string }
  ) {
    return DataService.request(
      "DELETE",
      contentType,
      "delete",
      id,
      undefined,
      undefined,
      headers
    );
  }

  static optionView(contentType: string, headers?: { [key: string]: string }) {
    return DataService.request(
      "OPTIONS",
      contentType,
      "list",
      undefined,
      undefined,
      undefined,
      headers
    );
  }
}

export { DataService };
