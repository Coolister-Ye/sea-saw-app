import { Table as BaseTable, ConfigProvider, Pagination } from "antd";
import { useState, useCallback, useRef } from "react";
import { createStyles } from "antd-style";
import View from "@/components/themed/View";
import Button from "@/components/themed/Button";
import EditableCell from "./EditableCell";
import EditableRow from "./EditableRow";
import { useTable } from "@/hooks/useTable";
import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from "react-native-heroicons/mini";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ColumnsToolBar } from "./ColumnToolBar";
import { Pressable } from "react-native";
import { SearchToolBar } from "./SearchToolBar";
import i18n from "@/locale/i18n";
import { Toast } from "../themed/Toast";

type TableProps = {
  table: string;
  columnOrder?: string[];
  fixedCols?: Partial<Record<"left" | "right", string[]>>;
  colConfig?: Record<string, any>;
  actionConfig?: Record<string, any>;
  ordering?: string;
  formula?: Record<string, (inputs: Record<string, any>) => any>;
  defaultColWidth?: number;
};

// Constants for column filters
const EXCLUDED_COLUMNS_SUFFIXES = [
  ".pk",
  ".id",
  ".created_by",
  ".updated_by",
  ".created_at",
  ".updated_at",
  ".owner",
  ".custom_fields",
];

export function Table({
  table,
  columnOrder,
  fixedCols,
  colConfig,
  actionConfig,
  ordering,
  formula,
  defaultColWidth,
}: TableProps) {
  const { styles } = useStyle();
  const tableRef = useRef<any>(null);
  const [showColumnBar, setShowColumnBar] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);

  // Custom hook for table data and pagination logic
  const {
    flatData,
    columns,
    dataCount,
    handleAdd,
    loading,
    handleColsRerange,
    paginationModel,
    error,
    handleDownload,
    handlePaginationChange: onPaginationChange,
    refreshData,
  } = useTable({
    table,
    tableRef,
    fixedCols,
    colConfig,
    actionConfig,
    ordering,
    defaultColWidth,
  });

  // Handlers
  const handlePaginationChange = (page: number, page_size: number) => {
    onPaginationChange({ page, page_size });
  };

  const handleColumnBarToggle = useCallback(() => {
    setShowColumnBar((prev) => !prev);
  }, []);

  const handleSearchBarToggle = useCallback(() => {
    setShowSearchBar((prev) => !prev);
  }, []);

  const handleColumnBarSubmit = (items: any[]) => {
    handleColsRerange(items);
    setShowColumnBar(false);
  };

  const handleSearchBarSubmit = (params: any) => {
    console.log("handleSearchBarSubmit", params);
    refreshData({
      filters: params,
      pagination: { page: 1, page_size: paginationModel.page_size },
    });
    setShowSearchBar(false);
  };

  // Table scroll and pagination configuration
  const tableScrollConfig = { x: "100%", y: "auto" };
  const paginationConfig = {
    showSizeChanger: true,
    defaultCurrent: 1,
    defaultPageSize: paginationModel.page_size,
    total: dataCount,
    onChange: handlePaginationChange,
  };

  return (
    <View
      variant="bg"
      className="h-full w-full flex-1 justify-between relative"
    >
      {/* Notification */}
      <Toast
        variant="error"
        message={error && (error?.message || "Unknown error")}
      />

      {/* Column Selector */}
      <View className="z-50">
        {showColumnBar && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="fixed z-50 inset-y-0 right-0 bg-white w-full md:w-96 border border-zinc-200 drop-shadow"
          >
            <ColumnsToolBar
              table={table}
              columns={columns}
              onCancel={() => setShowColumnBar(false)}
              onSubmit={handleColumnBarSubmit}
            />
          </Animated.View>
        )}
      </View>

      {/* Search Bar */}
      <View className="z-50">
        {showSearchBar && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="fixed z-50 inset-y-0 right-0 bg-white w-full md:w-[32rem] border border-zinc-200 drop-shadow"
          >
            <SearchToolBar
              columns={columns}
              onCancel={() => setShowSearchBar(false)}
              onSubmit={handleSearchBarSubmit}
            />
          </Animated.View>
        )}
      </View>

      {/* Table body */}
      <View className={`h-full ${styles.customTable} flex-1`}>
        <ConfigProvider
          theme={{
            components: {
              Table: {
                footerBg: "#ffffff",
                headerBorderRadius: 0,
                cellFontSizeSM: 12,
                cellPaddingBlockSM: 5,
                cellPaddingInlineSM: 5,
              },
            },
          }}
        >
          <BaseTable
            components={{
              body: {
                row: EditableRow,
                cell: EditableCell,
              },
            }}
            ref={tableRef}
            columns={columns}
            rowClassName={() => "editable-row"}
            dataSource={flatData}
            pagination={false}
            rowKey="key" // Use "id" or other unique key if "key" is not present
            bordered
            scroll={tableScrollConfig}
            size="small"
            title={renderTableTitle}
            footer={renderTableFooter}
            loading={loading}
            onRow={(record, recordIndex) =>
              ({
                index: recordIndex,
                formula: formula,
                record: record,
              } as any)
            }
          />
        </ConfigProvider>
      </View>
    </View>
  );

  function renderTableTitle() {
    return (
      <View variant="paper" className="flex-row justify-between items-center">
        <View>
          {actionConfig?.allowCreate !== false ? (
            <Button
              variant="primary"
              className="px-3 py-2 flex-row"
              // icon={<PlusCircleIcon className="text-zinc-100 mr-1" />}
              onPress={handleAdd}
            >
              {i18n.t("add")}
            </Button>
          ) : null}
        </View>
        <View className="mr-3 flex-row space-x-2">
          <Pressable onPress={handleColumnBarToggle}>
            <Cog6ToothIcon className="text-zinc-700 hover:text-zinc-600" />
          </Pressable>
          <Pressable onPress={handleSearchBarToggle}>
            <MagnifyingGlassIcon className="text-zinc-700 hover:text-zinc-600" />
          </Pressable>
          {actionConfig?.allowDownload !== false ? (
            <Pressable onPress={handleDownload}>
              <ArrowDownTrayIcon className="text-zinc-700 hover:text-zinc-600" />
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  function renderTableFooter() {
    return (
      <View className="items-end w-full" variant="paper">
        <Pagination
          size="small"
          {...paginationConfig}
          current={paginationModel.page}
        />
      </View>
    );
  }
}

const useStyle = createStyles(({ css }) => ({
  customTable: css`
    .ant-table-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .ant-spin-nested-loading {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .ant-spin-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .ant-table {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .ant-table-container {
              flex: 1;
              display: flex;
              flex-direction: column;
              overflow: hidden;

              .ant-table-header {
                flex: none; /* Ensure header uses actual height */
              }

              .ant-table-body {
                flex: 1; /* Let body fill remaining space */
                overflow: auto; /* Scrollable content */
              }

              .ant-table-footer {
                flex: none; /* Ensure footer uses actual height */
              }
            }
          }
        }
      }
    }

    .ant-table-wrapper .ant-table.ant-table-bordered > .ant-table-footer {
      border-top: 1px solid #f0f0f0;
      z-index: 99;
    }

    .editable-cell-value-wrap > div {
      min-height: 20px;
    }
  `,
}));
