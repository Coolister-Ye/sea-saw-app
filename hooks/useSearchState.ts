import { useState, useCallback } from "react";
import { Form } from "antd";
import type { FormInstance } from "antd";

export interface UseSearchStateReturn {
  /** 当前激活的过滤参数，传给 Table 的 queryParams */
  searchParams: Record<string, any>;
  /** 当前激活的过滤条件数量，传给 Badge count */
  searchParamCount: number;
  /** 搜索侧边栏是否展开 */
  isSearchOpen: boolean;
  /** Antd Form 实例，传给 Search 组件 */
  searchForm: FormInstance;
  /** 切换侧边栏展开/收起 */
  toggleSearch: () => void;
  /** 搜索表单 onFinish 回调 */
  handleSearchFinish: (filterParams: Record<string, any>) => void;
  /** 重置表单和搜索参数 */
  handleSearchReset: () => void;
}

export function useSearchState(): UseSearchStateReturn {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const handleSearchFinish = useCallback(
    (filterParams: Record<string, any>) => {
      setSearchParams(filterParams);
    },
    [],
  );

  const handleSearchReset = useCallback(() => {
    searchForm.resetFields();
    setSearchParams({});
  }, [searchForm]);

  return {
    searchParams,
    searchParamCount: Object.keys(searchParams).length,
    isSearchOpen,
    searchForm,
    toggleSearch,
    handleSearchFinish,
    handleSearchReset,
  };
}
