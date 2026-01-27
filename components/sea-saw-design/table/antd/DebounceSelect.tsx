import React, { useMemo, useRef, useState, forwardRef, useEffect } from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import debounce from "lodash/debounce";

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, "options" | "children"> {
  // 获取选项的异步函数，返回符合条件的选项
  fetchOptions: (search: string) => Promise<ValueType[]>;
  // 防抖的延迟时间（默认为 800ms）
  debounceTimeout?: number;
}

// 使用 forwardRef 将 ref 传递给 Select 组件
export const DebounceSelect = forwardRef<
  any, // ref 的类型，通常是 `HTMLSelectElement` 或 `Select` 组件类型
  DebounceSelectProps<any>
>(
  (
    { fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps<any>,
    ref
  ) => {
    // 用于控制加载状态的状态
    const [fetching, setFetching] = useState(false);
    // 用于存储选项数据的状态
    const [options, setOptions] = useState<any[]>([]);
    // 用于防止在并发请求时更新错误的状态
    const fetchRef = useRef(0);

    // 使用 useMemo 包装防抖的 fetch 函数，避免每次渲染都创建新的函数
    const debounceFetcher = useMemo(() => {
      // 加载选项的函数，带有防抖
      const loadOptions = (value: string) => {
        fetchRef.current += 1; // 请求 ID 自增，确保请求顺序正确
        const fetchId = fetchRef.current;
        setFetching(true); // 开始加载，显示 loading 状态
        setOptions([]); // 清空现有选项，避免旧的选项干扰

        // 发起请求，获取新的选项
        fetchOptions(value).then((newOptions) => {
          // 如果请求的 ID 已经改变，则跳过更新
          if (fetchId !== fetchRef.current) {
            return;
          }

          // 更新选项并关闭 loading 状态
          setOptions(newOptions);
          setFetching(false);
        });
      };

      // 使用 lodash 的 debounce 函数进行防抖
      return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    // 在组件首次加载时执行一次 fetch 请求
    useEffect(() => {
      debounceFetcher(""); // 空字符串触发请求，加载初始选项
    }, [debounceFetcher]);

    return (
      <Select
        ref={ref} // 将 ref 传递给 Select 组件
        filterOption={false} // 禁用 Select 内部的过滤功能，交由自定义的搜索逻辑处理
        onSearch={debounceFetcher} // 绑定防抖的搜索事件
        notFoundContent={fetching ? <Spin size="small" /> : null} // 如果正在加载则显示 loading 组件
        {...props} // 传递其他的 props
        options={options} // 渲染选项列表
      />
    );
  }
);
