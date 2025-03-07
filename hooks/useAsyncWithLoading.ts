import { useCallback, useState } from "react";

// 处理异步操作和 loading 状态的自定义 Hook，支持带参数的异步函数
export function useAsyncWithLoading<T, P = void>(
  asyncFunction: (params: P) => Promise<T>
) {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (params: P) => {
      setLoading(true);
      try {
        return await asyncFunction(params);
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, loading };
}
