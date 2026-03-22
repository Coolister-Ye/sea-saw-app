import { useCallback } from "react";
import { message } from "antd";

import i18n from "@/locale/i18n";
import { devError } from "@/utils/logger";
import { useAsyncWithLoading } from "@/hooks/useAsyncWithLoading";

export interface UseAsyncActionOptions {
  /** 成功后显示的提示文案（会经过 i18n.t() 翻译） */
  successMessage?: string;
  /** 失败后显示的提示文案（会经过 i18n.t() 翻译） */
  errorMessage?: string;
  /** 成功后回调 */
  onSuccess?: (result: any) => void;
  /** 失败后回调 */
  onError?: (error: unknown) => void;
}

/**
 * 在 useAsyncWithLoading 基础上封装 message 反馈的高级版本。
 * 适用于需要向用户展示操作结果提示的异步操作（如 download、export 等）。
 */
export function useAsyncAction<P = void>(
  asyncFn: (params: P) => Promise<any>,
  options: UseAsyncActionOptions = {},
) {
  const { successMessage, errorMessage, onSuccess, onError } = options;

  const wrappedFn = useCallback(
    async (params: P) => {
      try {
        const result = await asyncFn(params);
        if (successMessage) message.success(i18n.t(successMessage));
        onSuccess?.(result);
        return result;
      } catch (error) {
        devError("useAsyncAction error:", error);
        if (errorMessage) message.error(i18n.t(errorMessage));
        onError?.(error);
      }
    },
    [asyncFn, successMessage, errorMessage, onSuccess, onError],
  );

  return useAsyncWithLoading(wrappedFn);
}
