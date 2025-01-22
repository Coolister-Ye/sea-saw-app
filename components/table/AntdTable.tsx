import { Table as BaseTable, ConfigProvider, Pagination } from "antd";
import { useState, useCallback, useRef } from "react";
import { createStyles } from "antd-style";
import View from "@/components/themed/View";
import Button from "@/components/themed/Button";
import EditableCell from "./EditableCell";
import EditableRow from "./EditableRow";
import { useTable } from "@/hooks/useTable";
import {
  PlusCircleIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/mini";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ColumnsToolBar } from "./ColumnToolBar";
import { Pressable } from "react-native";
import { SearchToolBar } from "./SearchToolBar";
import Toast from "../themed/Toast";
import i18n from "@/locale/i18n";
import { useRect } from "@dnd-kit/core/dist/hooks/utilities";

type TableProps = {
  table: string;
  fixedCols?: Partial<Record<"left" | "right", string[]>>;
  colConfig?: Record<string, any>;
  actionConfig?: Record<string, any>;
  ordering?: string;
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
  fixedCols,
  colConfig,
  actionConfig,
  ordering,
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
    setPaginationModel,
    handleAdd,
    loading,
    loadTableData,
    handleColsRerange,
    paginationModel,
    error,
  } = useTable({
    table,
    tableRef,
    fixedCols,
    colConfig,
    actionConfig,
    ordering,
  });

  // Memoized columns filter logic
  // const updatedColumns = useMemo(() => filterColumns(columns), [columns]);
  // const updatedColumns = useMemo(() => hiddenColumns(columns), [columns]);

  // Handlers
  const handlePaginationChange = (page: number, page_size: number) => {
    setPaginationModel({ page, page_size });
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
    loadTableData(paginationModel, params);
    setShowSearchBar(false);
  };

  // Table scroll and pagination configuration
  const tableScrollConfig = { x: "100%", y: "auto" };
  const paginationConfig = {
    showSizeChanger: true,
    defaultCurrent: 1,
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
            className="fixed z-50 inset-y-0 right-0 bg-white w-full md:w-[28rem] border border-zinc-200 drop-shadow"
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
          />
        </ConfigProvider>
      </View>
    </View>
  );

  function filterColumns(columns: any[]) {
    return columns.filter(
      (col) =>
        !EXCLUDED_COLUMNS_SUFFIXES.some((suffix) =>
          col.dataIndex.endsWith(suffix)
        )
    );
  }

  function hiddenColumns(columns: any[]) {
    return columns.map((col) => {
      const hidden = EXCLUDED_COLUMNS_SUFFIXES.some((suffix) =>
        col.dataIndex.endsWith(suffix)
      );
      return { ...col, hidden };
    });
  }

  function renderTableTitle() {
    return (
      <View variant="paper" className="flex-row justify-between items-center">
        <View>
          {actionConfig?.allowCreate !== false ? (
            <Button
              variant="primary"
              className="px-3 py-2 flex-row"
              icon={<PlusCircleIcon className="text-zinc-100 mr-1" />}
              onPress={handleAdd}
            >
              {i18n.t("add")}
            </Button>
          ) : null}
        </View>
        <View className="mr-3 flex-row space-x-2">
          <Pressable onPress={handleColumnBarToggle}>
            <Cog6ToothIcon
              size={18}
              className="text-zinc-700 hover:text-zinc-600"
            />
          </Pressable>
          <Pressable onPress={handleSearchBarToggle}>
            <MagnifyingGlassIcon
              size={18}
              className="text-zinc-700 hover:text-zinc-600"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  function renderTableFooter() {
    return (
      <View className="items-end w-full" variant="paper">
        <Pagination size="small" {...paginationConfig} />
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
  `,
}));
