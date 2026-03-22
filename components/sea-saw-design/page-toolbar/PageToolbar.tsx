import React from "react";
import { View } from "react-native";
import { Badge, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import ActionDropdown from "@/components/sea-saw-design/action-dropdown";
import type { ActionDropdownProps } from "@/components/sea-saw-design/action-dropdown";

export interface PageToolbarProps {
  /** 当前激活的过滤条件数量，显示在 Filter 按钮的 Badge 上 */
  filterCount: number;
  /** 搜索侧边栏是否展开（控制按钮高亮） */
  isSearchOpen: boolean;
  /** 切换搜索侧边栏 */
  onToggleSearch: () => void;
  /** ActionDropdown 的 props，直接透传 */
  actionDropdownProps: ActionDropdownProps;
  /** 额外操作按钮，插入在 Filter 按钮和 ActionDropdown 之间 */
  extra?: React.ReactNode;
}

export function PageToolbar({
  filterCount,
  isSearchOpen,
  onToggleSearch,
  actionDropdownProps,
  extra,
}: PageToolbarProps) {
  return (
    <View className="flex-row justify-end gap-1 p-1 py-1.5">
      <Badge count={filterCount} size="small">
        <Button
          icon={<FilterOutlined />}
          onClick={onToggleSearch}
          type={isSearchOpen ? "primary" : "default"}
        />
      </Badge>
      {extra}
      <ActionDropdown {...actionDropdownProps} />
    </View>
  );
}

export default PageToolbar;
