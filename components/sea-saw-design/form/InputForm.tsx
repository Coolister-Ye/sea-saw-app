import { View, ScrollView } from "react-native";
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
import { useEffect } from "react";

import { InputFormProps } from "./interface";
import { useFormDefs, FormDef } from "@/hooks/useFormDefs";
import { useLocale } from "@/context/Locale";

/* ========================
 * 常量
 * ======================== */
const NUMERIC_TYPES = ["integer", "float", "double", "decimal"];
const DATE_TYPES = ["date", "datetime"];
const FILE_TYPES = ["file upload"];
const FORM_LAYOUT = { labelCol: { xs: 24, sm: 6 } };

/* ========================
 * 值处理工具函数
 * ======================== */
// 归一化日期值（日期对象 → 字符串）
export const normalizeDateValue = (val: any, type: string = "date") => {
  // 处理空值：空字符串、null、undefined 都返回 null（Django 接受 null）
  if (!val || val === "") return null;

  const date = dayjs(val);
  if (!date.isValid()) return null;

  // date: YYYY-MM-DD, datetime: YYYY-MM-DD HH:mm:ss
  const format = type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
  return date.format(format);
};

// 转换日期值用于显示（字符串 → 日期对象）
const parseDateValue = (val: any) => {
  if (!val) return null;
  const date = dayjs(val);
  return date.isValid() ? date : null;
};

// 创建默认归一化函数（处理日期类型和文件类型）
const createDefaultNormalizer = (col: FormDef) => {
  return (val: any) => {
    if (DATE_TYPES.includes(col.type)) {
      return normalizeDateValue(val, col.type);
    }
    // 文件上传：从 Upload 组件的 fileList 中提取文件对象
    if (FILE_TYPES.includes(col.type)) {
      if (val?.fileList && val.fileList.length > 0) {
        return val.fileList[0].originFileObj;
      }
      if (val?.file) {
        return val.file.originFileObj || val.file;
      }
      return val;
    }
    return val;
  };
};

// 创建默认值属性获取函数（处理日期类型）
const createDefaultValueProps = (col: FormDef) => {
  return (val: any) => {
    if (DATE_TYPES.includes(col.type)) {
      return { value: parseDateValue(val) };
    }
    return { value: val };
  };
};

/* ========================
 * Component
 * ======================== */
export default function InputForm({
  table,
  def,
  config,
  form,
  className,
  data,
  onValuesChange,
  onFieldsChange,
  onFinish,
  onFinishFailed,
  ...restFormProps
}: InputFormProps & { data?: Record<string, any> }) {
  const { i18n } = useLocale();

  /* ========================
   * 字段定义
   * ======================== */
  const formDefs = useFormDefs({ table, def });

  /* ========================
   * 同步外部数据
   * ======================== */
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Edit / Copy
      form.setFieldsValue(data);
    } else {
      // Create
      form.resetFields();
    }
  }, [data, form]);

  /* ========================
   * 渲染输入组件
   * ======================== */
  const renderInput = (col: FormDef) => {
    const isReadOnly = col.read_only;

    // 1. 文件上传
    if (FILE_TYPES.includes(col.type)) {
      return (
        <Upload
          maxCount={1}
          beforeUpload={() => false} // 阻止自动上传，手动处理
          disabled={isReadOnly}
        >
          <Button icon={<UploadOutlined />} disabled={isReadOnly}>
            {i18n.t("Select file")}
          </Button>
        </Upload>
      );
    }

    // 2. 选择框（下拉选项）
    if (col.choices) {
      return (
        <Select
          options={col.choices}
          disabled={isReadOnly}
          getPopupContainer={(node) => node.parentNode as HTMLElement}
        />
      );
    }

    // 3. 数字输入
    if (NUMERIC_TYPES.includes(col.type)) {
      return (
        <InputNumber
          style={{ width: "100%" }}
          disabled={isReadOnly}
          min={col.min_value}
          max={col.max_value}
        />
      );
    }

    // 4. 日期选择
    if (DATE_TYPES.includes(col.type)) {
      return (
        <DatePicker
          style={{ width: "100%" }}
          disabled={isReadOnly}
          showTime={col.type === "datetime"}
          format={col.type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss"}
          getPopupContainer={(node) => node.parentNode as HTMLElement}
        />
      );
    }

    // 5. 默认文本输入
    return <Input disabled={isReadOnly} />;
  };

  /* ========================
   * Render
   * ======================== */
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
          {formDefs.map((col) => {
            const colConfig = config?.[col.field];
            const { render, fullWidth, ...restConfig } = colConfig || {};

            // Determine read_only status: config overrides def
            const isReadOnly =
              config?.[col.field]?.read_only !== undefined
                ? config[col.field].read_only
                : col.read_only;

            // Create modified col with overridden read_only
            const modifiedCol = { ...col, read_only: isReadOnly };

            return (
              <Form.Item
                key={col.field}
                name={col.field}
                label={col.label}
                rules={col.required ? [{ required: true }] : undefined}
                normalize={createDefaultNormalizer(col)}
                getValueProps={createDefaultValueProps(col)}
                {...restConfig}
              >
                {render ? render(modifiedCol) : renderInput(modifiedCol)}
              </Form.Item>
            );
          })}
        </Form>
      </ScrollView>
    </View>
  );
}

export { InputForm };
export type { InputFormProps };
