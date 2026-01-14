// services/DataService.ts
import { fetchJson, getUrl } from "@/utils";
import { constants } from "@/constants/Constants";

export interface RequestConfig {
  uri: string;
  method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS";
  body?: object;
  params?: Record<string, any>;
  headers?: Record<string, any>;
  suffix?: string;
  signal?: AbortSignal;
  id?: string | number;
}

/**
 * ViewSet-style interface for CRUD operations on a resource
 * Similar to Django REST Framework ViewSets
 */
export interface ViewSet {
  list: (props?: Omit<RequestConfig, "uri" | "method" | "id">) => Promise<any>;
  create: (props?: Omit<RequestConfig, "uri" | "method" | "id">) => Promise<any>;
  retrieve: (props: Omit<RequestConfig, "uri" | "method"> & { id: string | number }) => Promise<any>;
  update: (props: Omit<RequestConfig, "uri" | "method"> & { id: string | number }) => Promise<any>;
  delete: (props: { id: string | number } & Pick<RequestConfig, "headers" | "signal">) => Promise<any>;
  options: (props?: Omit<RequestConfig, "uri" | "method">) => Promise<any>;
}

export class DataService {
  /**
   * Generic HTTP request handler
   * Constructs URL with optional ID, suffix, and query parameters
   */
  static async genericRequest(props: RequestConfig) {
    const { uri, method, body, params, headers, suffix, signal, id } = props;
    let baseUrl = getUrl(uri as keyof typeof constants.api);

    // Replace {id} placeholder if it exists in the URL
    if (baseUrl.includes("{id}")) {
      if (!id) {
        throw new Error(`URL template '${uri}' requires an 'id' parameter`);
      }
      baseUrl = baseUrl.replace("{id}", String(id));
    }
    // Otherwise, append ID in traditional REST style if provided
    else if (id) {
      baseUrl = `${baseUrl}${id}/`;
    }

    // Add query parameters if provided
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    const finalUrl = `${baseUrl}${suffix || ""}${queryString}`;

    return fetchJson({ url: finalUrl, method, body, headers, signal });
  }

  /**
   * Get a ViewSet instance for a specific resource
   * Returns an object with CRUD methods (list, create, retrieve, update, delete, options)
   *
   * @example
   * ```typescript
   * const orderViewSet = DataService.getViewSet('order');
   * await orderViewSet.list({ params: { status: 'pending' } });
   * await orderViewSet.retrieve({ id: 5 });
   * await orderViewSet.update({ id: 5, body: { status: 'completed' } });
   * await orderViewSet.delete({ id: 5 });
   * ```
   */
  static getViewSet(uri: string): ViewSet {
    return {
      list: (props = {}) =>
        DataService.genericRequest({ ...props, uri, method: "GET" }),

      create: (props = {}) =>
        DataService.genericRequest({ ...props, uri, method: "POST" }),

      retrieve: (props) =>
        DataService.genericRequest({ ...props, uri, method: "GET" }),

      update: (props) =>
        DataService.genericRequest({ ...props, uri, method: "PATCH" }),

      delete: (props) =>
        DataService.genericRequest({ ...props, uri, method: "DELETE" }),

      options: (props = {}) =>
        DataService.genericRequest({ ...props, uri, method: "OPTIONS" }),
    };
  }

  /**
   * List resources (GET without ID)
   */
  static async list(props: Omit<RequestConfig, "method" | "id">) {
    return DataService.genericRequest({ ...props, method: "GET" });
  }

  /**
   * Create resource (POST without ID)
   */
  static async create(props: Omit<RequestConfig, "method" | "id">) {
    return DataService.genericRequest({ ...props, method: "POST" });
  }

  /**
   * Retrieve single resource (GET with ID)
   */
  static async retrieve(props: Omit<RequestConfig, "method"> & { id: string | number }) {
    return DataService.genericRequest({ ...props, method: "GET" });
  }

  /**
   * Update resource (PATCH with ID)
   */
  static async update(props: Omit<RequestConfig, "method"> & { id: string | number }) {
    return DataService.genericRequest({ ...props, method: "PATCH" });
  }

  /**
   * Delete resource (DELETE with ID)
   */
  static async delete(props: Omit<RequestConfig, "method"> & { id: string | number }) {
    return DataService.genericRequest({ ...props, method: "DELETE" });
  }

  /**
   * Get resource options (OPTIONS)
   */
  static async options(props: Omit<RequestConfig, "method">) {
    return DataService.genericRequest({ ...props, method: "OPTIONS" });
  }
}
