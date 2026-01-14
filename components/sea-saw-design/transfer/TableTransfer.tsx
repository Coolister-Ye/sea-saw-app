import React, { useEffect, useState, useMemo } from "react";
import { Transfer, Table } from "antd";
import type { TableColumnsType, TransferProps } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import useDataService from "@/hooks/useDataService";

/** 差集函数，不依赖 lodash */
function difference<T>(array: T[], values: T[]): T[] {
  if (!Array.isArray(array) || !Array.isArray(values)) return [];
  const set = new Set(values);
  return array.filter((item) => !set.has(item));
}

const pagerToUrlParams = (pager: any) => ({
  page: pager.current,
  page_size: pager.pageSize,
});

interface TableTransferProps<T extends Record<string, any>>
  extends TransferProps<T> {
  leftColumns: TableColumnsType<T>;
  rightColumns: TableColumnsType<T>;
  rowKey?: (record: T) => string | number;
  entityType: string;
}

/** 支持分页请求的 TableTransfer */
function TableTransfer<T extends Record<string, any>>({
  leftColumns,
  rightColumns,
  rowKey = (record) => record.id || record.pk,
  entityType,
  ...restProps
}: TableTransferProps<T>) {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [dataSource, setDataSource] = useState<T[]>([]);
  const [totalDataSource, setTotalDataSource] = useState<T[]>([]);
  const { getViewSet } = useDataService();
  const viewSet = useMemo(() => getViewSet(entityType), [getViewSet, entityType]);

  /** fetchData 接收可选分页参数 */
  const fetchData = async (pager = pagination) => {
    setLoading(true);
    try {
      const response = await viewSet.list({
        params: pagerToUrlParams(pager),
      });
      setDataSource(response.data.results);
      setPagination((prev) => ({
        ...prev,
        total: response.data.count,
        current: pager.current,
        pageSize: pager.pageSize,
      }));
      // 累加到 totalDataSource，保证右边能显示已选项
      setTotalDataSource((prev) => {
        const map = new Map(
          [...prev, ...response.data.results].map((item) => [
            rowKey(item),
            item,
          ])
        );
        return Array.from(map.values());
      });
    } catch (error) {
      console.error(`Failed to load ${entityType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Transfer
      {...restProps}
      rowKey={rowKey}
      dataSource={totalDataSource}
      style={{ width: "100%" }}
    >
      {({
        direction,
        onItemSelect,
        onItemSelectAll,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === "left" ? leftColumns : rightColumns;

        const rowSelection: TableRowSelection<T> = {
          getCheckboxProps: (item) => ({
            disabled: listDisabled || (item as any).disabled,
          }),
          selectedRowKeys: listSelectedKeys,
          onSelectAll(selected, selectedRows) {
            const newKeys = selectedRows
              .filter((item) => !(item as any).disabled)
              .map((item) => rowKey(item));
            const diffKeys = selected
              ? difference(newKeys, listSelectedKeys)
              : difference(listSelectedKeys, newKeys);
            onItemSelectAll(diffKeys, selected);
          },
          onSelect(item, selected) {
            console.log("onSelect", item, selected);
            onItemSelect(rowKey(item), selected);
          },
        };

        /** 分页变更处理，直接传新的分页给 fetchData */
        const handleTableChange = (newPagination: any) => {
          if (direction === "left") {
            fetchData({
              ...pagination,
              current: newPagination.current,
              pageSize: newPagination.pageSize,
            });
          }
        };

        const rightDataSource = totalDataSource.filter((item) =>
          (restProps.targetKeys || []).includes(rowKey(item))
        );

        const leftDataSource = dataSource
          .map((item) => ({
            ...item,
            disabled: (restProps.targetKeys || []).includes(rowKey(item)),
          }))
          .filter((item) => item.disabled !== true);

        return (
          <Table<T>
            rowSelection={rowSelection}
            columns={columns}
            loading={direction === "left" && loading}
            dataSource={direction === "left" ? leftDataSource : rightDataSource}
            size="small"
            rowKey={rowKey}
            onRow={(record) => ({
              onClick: () => {
                if (listDisabled || (record as any).disabled) return;
                const key = rowKey(record);
                onItemSelect(key, !listSelectedKeys.includes(key as any));
              },
            })}
            onChange={handleTableChange}
            pagination={direction === "left" ? pagination : false}
            style={{ pointerEvents: listDisabled ? "none" : undefined }}
          />
        );
      }}
    </Transfer>
  );
}

export default TableTransfer;
export { TableTransfer };
export type { TableTransferProps };
