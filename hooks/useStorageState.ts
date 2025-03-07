import { useCallback, useEffect, useState } from "react";
import { getLocalData, setLocalData } from "@/utlis/storageHelper";

function useStorageState<T>(key: string) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<T | null>(null);

  // 初始化时从存储中获取数据
  useEffect(() => {
    getLocalData<T>(key)
      .then((value) => setState(value))
      .catch((e) => console.error("Initialize storage error", e))
      .finally(() => setLoading(false));
  }, [key]);

  // 更新存储数据
  const setValue = useCallback(
    async (value: T | null) => {
      // 先更新状态，提升 UI 响应速度
      setState(value);
      try {
        await setLocalData(key, value);
      } catch (e) {
        console.error("Set storage error", e);
      }
    },
    [key]
  );

  return { loading, state, setValue };
}

export { useStorageState };
export default useStorageState;
