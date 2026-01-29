// hooks/useDataService.ts
import { useCallback, useMemo } from "react";
import { DataService, ViewSet } from "@/services/DataService";
import { AuthError } from "@/services/AuthService";
import { useLocaleStore } from '@/stores/localeStore';
import { useAuthStore } from '@/stores/authStore';
import i18n from '@/locale/i18n';
import { usePathname, useRouter } from "expo-router";

/**
 * Hook that wraps DataService with authentication and error handling
 * Provides both direct methods and ViewSet-style API
 */
export default function useDataService() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocaleStore(state => state.locale);
  const setUser = useAuthStore(state => state._setUser);

  const commonHeaders = useMemo(
    () => ({ "Accept-Language": locale }),
    [locale]
  );

  const mergeHeaders = useCallback(
    (headers?: Record<string, string>) => ({ ...commonHeaders, ...headers }),
    [commonHeaders]
  );

  const handleError = useCallback(
    async (err: any) => {
      if (err instanceof AuthError) {
        // Clear auth state immediately so Stack.Protected allows navigation to login
        setUser(null);
        router.replace(`/login?next=${pathname}`);
        throw err;
      }
      if (err instanceof Error) throw err;
      throw new Error(i18n.t("An unknown error occurred"));
    },
    [pathname, router, setUser]
  );

  const wrapCall = useCallback(
    <T extends (...args: any[]) => Promise<any>>(fn: T) =>
      (props: any) =>
        fn({ ...props, headers: mergeHeaders(props?.headers) }).catch(
          handleError
        ),
    [mergeHeaders, handleError]
  );

  /**
   * Get a ViewSet instance for a resource with automatic header injection and error handling
   *
   * @example
   * ```typescript
   * const { getViewSet } = useDataService();
   * const order = getViewSet('order');
   *
   * // List orders
   * await order.list({ params: { status: 'pending' } });
   *
   * // Get single order
   * await order.retrieve({ id: 5 });
   *
   * // Update order
   * await order.update({ id: 5, body: { status: 'completed' } });
   *
   * // Delete order
   * await order.delete({ id: 5 });
   * ```
   */
  const getViewSet = useCallback(
    (uri: string): ViewSet => {
      const viewSet = DataService.getViewSet(uri);
      return {
        list: wrapCall(viewSet.list),
        create: wrapCall(viewSet.create),
        retrieve: wrapCall(viewSet.retrieve),
        update: wrapCall(viewSet.update),
        delete: wrapCall(viewSet.delete),
        options: wrapCall(viewSet.options),
      };
    },
    [wrapCall]
  );

  return {
    // ViewSet-style API (recommended)
    getViewSet,

    // Direct methods (for backward compatibility and one-off requests)
    list: wrapCall(DataService.list),
    create: wrapCall(DataService.create),
    retrieve: wrapCall(DataService.retrieve),
    update: wrapCall(DataService.update),
    delete: wrapCall(DataService.delete),
    options: wrapCall(DataService.options),

    // Generic request for custom operations
    request: wrapCall(DataService.genericRequest),
  };
}
