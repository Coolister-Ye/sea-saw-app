import { View, ScrollView } from "react-native";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect } from "react";

import { InputFormProps } from "./interface";
import { useFormDefs, FormDef } from "@/hooks/useFormDefs";

/* ========================
 * 常量
 * ======================== */
const NUMERIC_TYPES = ["integer", "float", "double", "decimal"];
const DATE_TYPES = ["date", "datetime"];

const FORM_LAYOUT = { labelCol: { xs: 24, sm: 6 } };

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
}: InputFormProps & { data?: Record<string, any> }) {
  const usedForm = form;

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
      usedForm.setFieldsValue(data);
    } else {
      // Create
      usedForm.resetFields();
    }
  }, [data, usedForm]);

  /* ========================
   * 输入组件选择
   * ======================== */
  const renderInput = (col: FormDef) => {
    /** 自定义渲染优先 */
    if (config?.[col.field]?.render) {
      return config[col.field].render(col);
    }

    if (col.choices) {
      return (
        <Select
          options={col.choices}
          disabled={col.read_only}
          getPopupContainer={(node) => node.parentNode as HTMLElement}
        />
      );
    }

    if (NUMERIC_TYPES.includes(col.type)) {
      return <InputNumber style={{ width: "100%" }} disabled={col.read_only} />;
    }

    if (DATE_TYPES.includes(col.type)) {
      return (
        <DatePicker
          style={{ width: "100%" }}
          disabled={col.read_only}
          getPopupContainer={(node) => node.parentNode as HTMLElement}
        />
      );
    }

    return <Input disabled={col.read_only} />;
  };

  /* ========================
   * 值归一化（提交前）
   * ======================== */
  const normalizeValue = (val: any, col: FormDef) => {
    if (!DATE_TYPES.includes(col.type) || !val) return val;
    const date = dayjs(val);
    return date.isValid() ? date.format("YYYY-MM-DD") : undefined;
  };

  /* ========================
   * 值展示（回显）
   * ======================== */
  const getValueProps = (val: any, col: FormDef) => {
    if (!DATE_TYPES.includes(col.type)) return { value: val };
    if (!val) return { value: null };

    const date = dayjs(val);
    return { value: date.isValid() ? date : null };
  };

  /* ========================
   * Render
   * ======================== */
  return (
    <View className={clsx("w-full flex-1", className)}>
      <ScrollView className="w-full flex-1 p-2">
        <Form
          form={usedForm}
          name={`form_${table}`}
          layout="vertical"
          preserve={false}
          {...FORM_LAYOUT}
        >
          {formDefs.map((col) => (
            <Form.Item
              key={col.field}
              name={col.field}
              label={col.label}
              rules={col.required ? [{ required: true }] : undefined}
              normalize={(val) => normalizeValue(val, col)}
              getValueProps={(val) => getValueProps(val, col)}
              hidden={config?.[col.field]?.hidden}
            >
              {renderInput(col)}
            </Form.Item>
          ))}
        </Form>
      </ScrollView>
    </View>
  );
}

export { InputForm };
export type { InputFormProps };
