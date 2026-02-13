import { View, ScrollView } from "react-native";
import i18n from '@/locale/i18n';
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useMemo } from "react";

import { InputFormProps } from "./interface";
import { useFormDefs, FormDef } from "@/hooks/useFormDefs";
import { convertToFormDefs, sortFormDefs } from "@/utils/formDefUtils";

// Constants
const NUMERIC_TYPES = new Set(["integer", "float", "double", "decimal"]);
const DATE_TYPES = new Set(["date", "datetime"]);
const FILE_TYPES = new Set(["file upload"]);
const FORM_LAYOUT = { labelCol: { xs: 24, sm: 6 } };
const DATE_FORMAT = "YYYY-MM-DD";
const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

// Value normalization utilities
export const normalizeDateValue = (val: any, type: string = "date") => {
  if (!val || val === "") return null;

  const date = dayjs(val);
  if (!date.isValid()) return null;

  return date.format(type === "date" ? DATE_FORMAT : DATETIME_FORMAT);
};

const parseDateValue = (val: any) => {
  if (!val) return null;
  const date = dayjs(val);
  return date.isValid() ? date : null;
};

const normalizeFileValue = (val: any) => {
  if (val?.fileList?.[0]?.originFileObj) {
    return val.fileList[0].originFileObj;
  }
  if (val?.file) {
    return val.file.originFileObj || val.file;
  }
  return val;
};

const createNormalizer = (type: string) => (val: any) => {
  if (DATE_TYPES.has(type)) return normalizeDateValue(val, type);
  if (FILE_TYPES.has(type)) return normalizeFileValue(val);
  return val;
};

const createValueProps = (type: string) => (val: any) => ({
  value: DATE_TYPES.has(type) ? parseDateValue(val) : val,
});

// Input renderer
const renderInput = (col: FormDef, placeholder?: string) => {
  const { type, read_only: disabled, choices, min_value, max_value } = col;

  if (FILE_TYPES.has(type)) {
    return (
      <Upload maxCount={1} beforeUpload={() => false} disabled={disabled}>
        <Button icon={<UploadOutlined />} disabled={disabled}>
          {i18n.t("Select file")}
        </Button>
      </Upload>
    );
  }

  if (choices) {
    return (
      <Select
        options={choices}
        disabled={disabled}
        placeholder={placeholder}
        getPopupContainer={(node) => node.parentNode as HTMLElement}
      />
    );
  }

  if (NUMERIC_TYPES.has(type)) {
    return (
      <InputNumber
        style={{ width: "100%" }}
        disabled={disabled}
        placeholder={placeholder}
        min={min_value}
        max={max_value}
      />
    );
  }

  if (DATE_TYPES.has(type)) {
    return (
      <DatePicker
        style={{ width: "100%" }}
        disabled={disabled}
        placeholder={placeholder}
        showTime={type === "datetime"}
        format={type === "date" ? DATE_FORMAT : DATETIME_FORMAT}
        getPopupContainer={(node) => node.parentNode as HTMLElement}
      />
    );
  }

  return <Input disabled={disabled} placeholder={placeholder} />;
};

export default function InputForm({
  table,
  def,
  config,
  form,
  className,
  data,
  hideReadOnly = false,
  showHelpTextAsPlaceholder = true,
  columnOrder,
  onValuesChange,
  onFieldsChange,
  onFinish,
  onFinishFailed,
  ...restFormProps
}: InputFormProps & { data?: Record<string, any> }) {
  // Strategy: Use local def if provided, otherwise fetch from network
  const shouldFetchFromNetwork = !def && !!table;

  // Fetch from network (only if needed, empty string skips fetch)
  const networkFormDefs = useFormDefs({
    table: shouldFetchFromNetwork ? table! : "",
    columnOrder,
  });

  // Convert local def to FormDef[]
  const localFormDefs = useMemo(() => {
    if (!def) return [];
    const converted = convertToFormDefs(def);
    return sortFormDefs(converted, columnOrder);
  }, [def, columnOrder]);

  // Use local defs if available, otherwise network defs
  const formDefs = def ? localFormDefs : networkFormDefs;

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      form.setFieldsValue(data);
    }
  }, [data, form]);

  // Preprocess form items to avoid recreating objects on each render
  const formItems = useMemo(() => {
    return formDefs.map((col) => {
      const fieldConfig = config?.[col.field] || {};
      const {
        render,
        read_only: configReadOnly,
        hidden: configHidden,
        rules: configRules,
        fullWidth, // Destructure to prevent DOM prop warning
        ...restConfig
      } = fieldConfig;

      const isReadOnly = configReadOnly ?? col.read_only;
      const isHidden = configHidden ?? col.hidden ?? (hideReadOnly && isReadOnly);
      const formRules = configRules ?? (col.required ? [{ required: true }] : undefined);
      const placeholder = showHelpTextAsPlaceholder ? col.help_text : undefined;
      const modifiedCol = { ...col, read_only: isReadOnly };

      return {
        col,
        modifiedCol,
        isHidden,
        formRules,
        placeholder,
        render,
        restConfig,
      };
    });
  }, [formDefs, config, hideReadOnly, showHelpTextAsPlaceholder]);

  return (
    <View className={clsx("w-full flex-1", className)}>
      <ScrollView className="w-full flex-1 p-2">
        <Form
          form={form}
          name={`form_${table}`}
          layout="vertical"
          preserve={false}
          onValuesChange={onValuesChange}
          onFieldsChange={onFieldsChange}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          {...FORM_LAYOUT}
          {...restFormProps}
        >
          {formItems.map(({ col, modifiedCol, isHidden, formRules, placeholder, render, restConfig }) => (
            <Form.Item
              key={col.field}
              name={col.field}
              label={col.label}
              rules={formRules}
              normalize={createNormalizer(col.type)}
              getValueProps={createValueProps(col.type)}
              hidden={isHidden}
              {...restConfig}
            >
              {render ? render(modifiedCol) : renderInput(modifiedCol, placeholder)}
            </Form.Item>
          ))}
        </Form>
      </ScrollView>
    </View>
  );
}

export { InputForm };
export type { InputFormProps };
