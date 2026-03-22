/**
 * StandardCRUDPage - 标准 CRUD 页面模板
 *
 * 将「搜索侧边栏 + 工具栏 + 表单抽屉 + 展示抽屉 + 表格」的通用布局封装为可复用组件。
 * 通过 slot 组件 props 注入各实体的具体 UI，消除各 CRUD 页面之间的大量重复代码。
 *
 * 用法示例：
 * ```tsx
 * <StandardCRUDPage
 *   entity="contact"
 *   nameField="name"
 *   enableDelete
 *   SearchComponent={ContactSearch}
 *   FormInputComponent={ContactFormInput}
 *   DisplayComponent={ContactDisplay}
 *   TableComponent={ContactTable}
 * />
 * ```
 */

import React from "react";
import "@/css/tableStyle.css";
import { View } from "react-native";
import type { FormInstance } from "antd";

import { useEntityPage } from "@/hooks/useEntityPage";
import { useSearchState } from "@/hooks/useSearchState";
import { PageLoading } from "@/components/sea-saw-page/base/PageLoading";
import { PageToolbar } from "@/components/sea-saw-design/page-toolbar";

import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import type { FormDef } from "@/hooks/useFormDefs";

/* ── Slot 组件接口 ── */

export interface SearchSlotProps {
  form: FormInstance;
  metadata: Record<string, HeaderMetaProps>;
  onFinish: (params: Record<string, unknown>) => void;
  onReset: () => void;
}

export interface FormInputSlotProps {
  isOpen: boolean;
  def: FormDef[];
  data: any;
  onClose: (res?: any) => void;
  onCreate: (res?: any) => void;
  onUpdate: (res?: any) => void;
}

export interface DisplaySlotProps {
  isOpen: boolean;
  def: FormDef[];
  data: any;
  onClose: () => void;
  onUpdate: (res?: any) => void;
}

export interface TableSlotProps {
  tableRef: React.RefObject<any>;
  headerMeta: Record<string, HeaderMetaProps>;
  queryParams: Record<string, any>;
  columnOrder?: string[];
  onGridReady: (params: any) => void;
  onRowClicked: (e: any) => void;
  onSelectionChanged: (e: any) => void;
}

/* ── StandardCRUDPage Props ── */

export interface StandardCRUDPageProps {
  /** 实体名（对应 useEntityPage entity 参数） */
  entity: string;
  /** 删除确认框显示的名称字段 */
  nameField?: string;
  /** 是否启用删除功能 */
  enableDelete?: boolean;
  /** 列顺序，透传给 FormInput / Display / Table */
  columnOrder?: string[];
  /** 自定义 copy 数据构建函数 */
  buildCopyData?: (data: unknown) => unknown;
  /** 从 copy 数据中排除的字段 */
  excludeFromCopy?: string[];
  /** 从 OPTIONS meta 中过滤掉的字段 */
  filterMetaFields?: string[];

  /** 搜索侧边栏组件（可选） */
  SearchComponent?: React.ComponentType<SearchSlotProps>;
  /** 表单（新建/编辑）抽屉组件 */
  FormInputComponent: React.ComponentType<FormInputSlotProps>;
  /** 展示抽屉组件 */
  DisplayComponent: React.ComponentType<DisplaySlotProps>;
  /** 表格组件 */
  TableComponent: React.ComponentType<TableSlotProps>;

  /** 插入在 Filter 按钮和 ActionDropdown 之间的额外操作按钮 */
  extraToolbarActions?: React.ReactNode;
}

/* ── Component ── */

export function StandardCRUDPage({
  entity,
  nameField,
  enableDelete,
  columnOrder,
  buildCopyData,
  excludeFromCopy,
  filterMetaFields,
  SearchComponent,
  FormInputComponent,
  DisplayComponent,
  TableComponent,
  extraToolbarActions,
}: StandardCRUDPageProps) {
  const {
    searchParams,
    searchParamCount,
    isSearchOpen,
    searchForm,
    toggleSearch,
    handleSearchFinish,
    handleSearchReset,
  } = useSearchState();

  const {
    loadingMeta,
    metaError,
    headerMeta,
    formDefs,
    isEditOpen,
    isViewOpen,
    viewRow,
    editData,
    copyDisabled,
    deleteDisabled,
    openCreate,
    openCopy,
    openDelete,
    closeView,
    closeEdit,
    handleCreateSuccess,
    handleUpdateSuccess,
    tableRef,
    tableProps,
    contextHolder,
  } = useEntityPage({
    entity,
    nameField,
    enableDelete,
    buildCopyData,
    excludeFromCopy,
    filterMetaFields,
  });

  return (
    <PageLoading loading={loadingMeta} error={metaError}>
      <View className="flex-1 bg-white flex-row">
        {contextHolder}

        {/* 左侧搜索侧边栏（可选） */}
        {isSearchOpen && SearchComponent && (
          <SearchComponent
            form={searchForm}
            metadata={headerMeta}
            onFinish={handleSearchFinish}
            onReset={handleSearchReset}
          />
        )}

        {/* 右侧：工具栏 + 抽屉 + 表格 */}
        <View className="flex-1">
          <PageToolbar
            filterCount={searchParamCount}
            isSearchOpen={isSearchOpen}
            onToggleSearch={toggleSearch}
            actionDropdownProps={{
              onPrimaryAction: openCreate,
              onCopy: openCopy,
              onDelete: openDelete,
              copyDisabled,
              deleteDisabled,
            }}
            extra={extraToolbarActions}
          />

          {/* 新建 / 复制 Drawer */}
          <FormInputComponent
            isOpen={isEditOpen}
            def={formDefs}
            data={editData}
            onClose={closeEdit}
            onCreate={handleCreateSuccess}
            onUpdate={handleUpdateSuccess}
          />

          {/* 展示 Drawer */}
          <DisplayComponent
            isOpen={isViewOpen}
            def={formDefs}
            data={viewRow}
            onClose={closeView}
            onUpdate={handleUpdateSuccess}
          />

          {/* 表格 */}
          <TableComponent
            tableRef={tableRef}
            headerMeta={headerMeta}
            queryParams={searchParams}
            columnOrder={columnOrder}
            {...tableProps}
          />
        </View>
      </View>
    </PageLoading>
  );
}

export default StandardCRUDPage;
