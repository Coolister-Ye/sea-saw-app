import dayjs from "dayjs";
import {
  AutoComplete,
  DatePicker,
  Form,
  InputNumber,
  Select,
  Space,
} from "antd";
import i18n from "@/locale/i18n";
import { DebounceSelect } from "@/components/sea-saw-design/table/antd/DebounceSelect";
import { useMemo, useState } from "react";
import { NumberRangeInput } from "@/components/sea-saw-design/table/antd/NumberRangeInput";
import type { FilterType } from "../table/interface";

const { RangePicker } = DatePicker;

// Constants
export const NUMERIC_TYPES = new Set(["decimal", "float", "integer"]);
export const DATE_TYPES = new Set(["date", "datetime"]);
export const DATE_FORMAT = "YYYY-MM-DD";
export const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const RANGE_OPERATION = "range";
export const EXACT_OPERATION = "exact";
export const IEXACT_OPERATION = "iexact";
export const ISNULL_OPERATION = "isnull";
export const ISNULL_EX_OPERATION = "isnull_ex";
export const IN_OPERATION = "in";

// Types
export type OptionType = {
  value: any;
  label: string;
};

export type SearchColumn = {
  title: string;
  dataIndex: string;
  operations?: FilterType[];
  options?: OptionType[];
  getOptions?: (search: string) => Promise<OptionType[]>;
  variant?: "picklist" | "text" | "lookup" | "datepicker";
  type: string;
};

// Utility functions
export const formatDataIndex = (dataIndex: string): string =>
  dataIndex.replace(/\./g, "__");

export const formatDateValue = (
  value: any,
  format: string = DATE_FORMAT,
): string | string[] | null => {
  if (!value) return null;

  if (Array.isArray(value)) {
    return value
      .filter((v) => dayjs(v).isValid())
      .map((v) => dayjs(v).format(format));
  }

  const date = dayjs(value);
  return date.isValid() ? date.format(format) : null;
};

export function SearchFieldInput({
  operations = [],
  dataIndex,
  variant,
  getOptions,
  type,
  options,
  showOperationSelector = true,
}: SearchColumn & { showOperationSelector?: boolean }) {
  const operationOpts = useMemo(() => {
    const base = operations.map((opr) => ({
      value: opr,
      label: i18n.t(opr),
      key: opr,
    }));

    const supportsRange = variant === "datepicker" || NUMERIC_TYPES.has(type);
    const hasRange = operations.includes(RANGE_OPERATION as FilterType);

    if (supportsRange && !hasRange) {
      return [
        ...base,
        {
          value: RANGE_OPERATION,
          label: i18n.t("between"),
          key: RANGE_OPERATION,
        },
      ];
    }

    return base;
  }, [operations, variant, type]);

  const [currentOpr, setCurrentOpr] = useState<string>(
    operationOpts[0]?.value ?? EXACT_OPERATION,
  );

  const formatedDi = formatDataIndex(dataIndex);
  const dateFormat = type === "datetime" ? DATETIME_FORMAT : DATE_FORMAT;
  const isMultiSelect = currentOpr === IN_OPERATION;

  function renderInput() {
    if (currentOpr === ISNULL_OPERATION || currentOpr === ISNULL_EX_OPERATION) {
      return (
        <Select
          style={{ width: "100%" }}
          options={[
            { value: "true", label: i18n.t("true") },
            { value: "false", label: i18n.t("false") },
          ]}
          allowClear
        />
      );
    }

    if (variant === "picklist") {
      return (
        <Select
          style={{ width: "100%" }}
          mode={isMultiSelect ? "multiple" : undefined}
          options={options}
          allowClear
        />
      );
    }

    if (variant === "lookup" && getOptions) {
      return (
        <DebounceSelect
          style={{ width: "100%" }}
          mode={isMultiSelect ? "multiple" : undefined}
          fetchOptions={getOptions}
          showSearch
          allowClear
        />
      );
    }

    if (variant === "datepicker") {
      return currentOpr === RANGE_OPERATION ? (
        <RangePicker
          style={{ width: "100%" }}
          format={dateFormat}
          showTime={type === "datetime"}
        />
      ) : (
        <DatePicker
          style={{ width: "100%" }}
          format={dateFormat}
          showTime={type === "datetime"}
        />
      );
    }

    if (NUMERIC_TYPES.has(type)) {
      return currentOpr === RANGE_OPERATION ? (
        <NumberRangeInput style={{ width: "100%" }} />
      ) : (
        <InputNumber style={{ width: "100%" }} />
      );
    }

    return <AutoComplete style={{ width: "100%" }} options={options} />;
  }

  const showOprSelector = showOperationSelector && operationOpts.length > 1;

  const valueItem = (
    <Form.Item
      name={formatedDi}
      getValueProps={(value) => ({
        value:
          variant === "datepicker"
            ? formatDateValue(value, dateFormat)
            : value,
      })}
      normalize={(value) =>
        variant === "datepicker" ? formatDateValue(value, dateFormat) : value
      }
      noStyle
    >
      {renderInput()}
    </Form.Item>
  );

  if (!showOprSelector) {
    return valueItem;
  }

  return (
    <Space.Compact block>
      <Form.Item
        name={`${formatedDi}-operation`}
        noStyle
        initialValue={currentOpr}
      >
        <Select
          options={operationOpts}
          onChange={setCurrentOpr}
          style={{ width: 150 }}
          className="bg-gray-50"
        />
      </Form.Item>
      {valueItem}
    </Space.Compact>
  );
}
