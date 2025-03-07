import { useState, useCallback } from "react";
import {
  DataService,
  ViewsetRequestParams,
  RequestConfig,
} from "@/services/DataService";
import { AuthError } from "@/services/AuthService";
import { FetchError } from "@/utlis/webHelper";
import { useLocale } from "@/context/Locale";
import { usePathname, useRouter } from "expo-router";

// API Response structure
interface ApiResponse {
  status: boolean;
  data?: any;
  error?: ErrorState;
}

// Error state structure
interface ErrorState {
  message: string;
  status?: string | number;
}

// Success state structure
interface SuccState {
  message: string;
}

export default function useDataService() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, i18n } = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState<SuccState | null>(null);

  const commonHeader = { "Accept-Language": locale };

  // Merge default and custom headers
  const mergeHeaders = useCallback(
    (headers?: Record<string, string>) => ({
      ...commonHeader,
      ...headers,
    }),
    [locale]
  );

  // Clear both error and success states
  const clearStates = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Unified API call handler
  const handleApiCall = useCallback(
    async (
      apiCall: () => Promise<any>,
      successMessage?: string
    ): Promise<ApiResponse> => {
      setLoading(true);
      clearStates();

      try {
        const data = await apiCall();
        if (successMessage) {
          setSuccess({ message: i18n.t(successMessage) });
        }
        return { status: true, data };
      } catch (err) {
        const errorState = handleError(err);
        setError(errorState);
        return { status: false, error: errorState };
      } finally {
        setLoading(false);
      }
    },
    [clearStates, i18n]
  );

  // Error handler
  const handleError = (err: any): ErrorState => {
    if (err instanceof FetchError) {
      return { message: err.message, status: err.status };
    } else if (err instanceof AuthError) {
      router.replace(`/login?next=${pathname}`);
      return { message: err.message, status: "auth-error" };
    } else {
      return {
        message:
          err instanceof Error
            ? err.message
            : i18n.t("An unknown error occurred"),
        status: "unknown-error",
      };
    }
  };

  // Generic CRUD API operations
  const create = useCallback(
    async (props: ViewsetRequestParams): Promise<ApiResponse> => {
      return handleApiCall(
        () =>
          DataService.createView({
            ...props,
            headers: mergeHeaders(props.headers),
          }),
        i18n.t("Create successfully")
      );
    },
    [handleApiCall, mergeHeaders]
  );

  const update = useCallback(
    async (props: ViewsetRequestParams): Promise<ApiResponse> => {
      return handleApiCall(
        () =>
          DataService.updateView({
            ...props,
            headers: mergeHeaders(props.headers),
          }),
        i18n.t("Update successfully")
      );
    },
    [handleApiCall, mergeHeaders]
  );

  const list = useCallback(
    async (props: ViewsetRequestParams): Promise<ApiResponse> => {
      return handleApiCall(() =>
        DataService.listView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      );
    },
    [handleApiCall, mergeHeaders]
  );

  const deleteItem = useCallback(
    async (props: ViewsetRequestParams): Promise<ApiResponse> => {
      return handleApiCall(
        () =>
          DataService.deleteView({
            ...props,
            headers: mergeHeaders(props.headers),
          }),
        i18n.t("Delete successfully")
      );
    },
    [handleApiCall, mergeHeaders]
  );

  const options = useCallback(
    async (props: ViewsetRequestParams): Promise<ApiResponse> => {
      return handleApiCall(() =>
        DataService.optionView({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      );
    },
    [handleApiCall, mergeHeaders]
  );

  // Generic request handler
  const request = useCallback(
    async (props: RequestConfig): Promise<ApiResponse> => {
      return handleApiCall(() =>
        DataService.genericRequest({
          ...props,
          headers: mergeHeaders(props.headers),
        })
      );
    },
    [handleApiCall, mergeHeaders]
  );

  // Expose functions and state
  return {
    create,
    update,
    list,
    deleteItem,
    options,
    request,
    loading,
    error,
    success,
    clearStates,
  };
}
