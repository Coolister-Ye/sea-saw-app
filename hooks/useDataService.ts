import { useCallback } from "react";
import {
  DataService,
  ViewsetRequestParams,
  RequestConfig,
} from "@/services/DataService";
import { AuthError } from "@/services/AuthService";
import { useLocale } from "@/context/Locale";
import { usePathname, useRouter } from "expo-router";

export default function useDataService() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, i18n } = useLocale();

  const commonHeader = { "Accept-Language": locale };

  // Merge default and custom headers
  const mergeHeaders = useCallback(
    (headers?: Record<string, string>) => ({
      ...commonHeader,
      ...headers,
    }),
    [locale]
  );

  // 统一请求错误处理
  const handleError = useCallback(
    async (err: any) => {
      if (err instanceof AuthError) {
        router.replace(`/login?next=${pathname}`);
        throw err;
      }

      // 如果是 FetchError 或普通 Error
      if (err.response) {
        // 尝试解析返回的 JSON
        let msg: string;
        try {
          const data = await err.response.json();
          msg = JSON.stringify(data);
        } catch {
          msg = err.response.statusText || "Request failed";
        }
        const error = new Error(msg);
        (error as any).status = err.response.status;
        throw error;
      } else if (err instanceof Error) {
        throw err;
      } else {
        throw new Error(i18n.t("An unknown error occurred"));
      }
    },
    [i18n, pathname, router]
  );

  // 封装请求，统一处理非 2xx 状态码
  const requestWrapper = useCallback(
    async (apiCall: () => Promise<any>) => {
      try {
        const res = await apiCall();

        // DataService 的请求可能返回 { ok, status, json() } 等
        // 这里假设 DataService 已经封装 fetch，如果有非 2xx，抛出异常
        if ("ok" in res && !res.ok) {
          let errMsg: string;
          try {
            const data = await res.json();
            errMsg = JSON.stringify(data);
          } catch {
            errMsg = res.statusText || "Request failed";
          }
          const error = new Error(errMsg);
          (error as any).status = res.status;
          throw error;
        }

        return res;
      } catch (err) {
        await handleError(err);
      }
    },
    [handleError]
  );

  // CRUD API
  const create = useCallback(
    (props: ViewsetRequestParams) =>
      requestWrapper(() =>
        DataService.createView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      ),
    [mergeHeaders, requestWrapper]
  );

  const update = useCallback(
    (props: ViewsetRequestParams) =>
      requestWrapper(() =>
        DataService.updateView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      ),
    [mergeHeaders, requestWrapper]
  );

  const list = useCallback(
    (props: ViewsetRequestParams) =>
      requestWrapper(() =>
        DataService.listView({ ...props, headers: mergeHeaders(props.headers) })
      ),
    [mergeHeaders, requestWrapper]
  );

  const retrieve = useCallback(
    (props: ViewsetRequestParams) =>
      requestWrapper(() =>
        DataService.retrieveView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      ),
    [mergeHeaders, requestWrapper]
  );

  const deleteItem = useCallback(
    (props: ViewsetRequestParams) =>
      requestWrapper(() =>
        DataService.deleteView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      ),
    [mergeHeaders, requestWrapper]
  );

  const options = useCallback(
    (props: ViewsetRequestParams) =>
      requestWrapper(() =>
        DataService.optionView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      ),
    [mergeHeaders, requestWrapper]
  );

  const request = useCallback(
    (props: RequestConfig) =>
      requestWrapper(() =>
        DataService.genericRequest({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      ),
    [mergeHeaders, requestWrapper]
  );

  return {
    create,
    update,
    list,
    deleteItem,
    options,
    retrieve,
    request,
  };
}
