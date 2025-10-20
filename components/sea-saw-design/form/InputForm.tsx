import { View, ScrollView } from "react-native";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import clsx from "clsx";
import dayjs from "dayjs";
import ForeignKeyForm from "./ForeignKeyForm";
import { InputFormProps } from "./interface";
import { useFormDefs, FormDef } from "@/hooks/useFormDefs";

const NUMERICAL_TYPES = ["integer", "float", "double", "decimal"];
const DATE_TYPES = ["date", "datetime"];

const layout = {
  labelCol: { xs: { span: 24 }, sm: { span: 6 } },
};

function InputForm({ table, def, config, form, className }: InputFormProps) {
  const [innerForm] = Form.useForm();
  const usedForm = form ?? innerForm;
  const formDefs = useFormDefs({ table, def });

  const renderInput = (def: FormDef) => {
    if (config?.[def.field]?.render) return config[def.field].render(def);

    if (def.choices)
      return (
        <Select
          options={def.choices}
          getPopupContainer={(node) => node.parentNode as HTMLElement}
        />
      );

    if (NUMERICAL_TYPES.includes(def.type))
      return <InputNumber style={{ width: "100%" }} />;

    if (DATE_TYPES.includes(def.type))
      return (
        <DatePicker
          style={{ width: "100%" }}
          getPopupContainer={(node) => node.parentNode as HTMLElement}
        />
      );

    if (["nested object", "field"].includes(def.type))
      return (
        <ForeignKeyForm
          dataType={def}
          field={def.field}
          onChange={(val) => usedForm.setFieldsValue({ [def.field]: val })}
        />
      );

    return <Input />;
  };

  const normalizeDate = (value: any, def: FormDef) => {
    if (!DATE_TYPES.includes(def.type) || !value) return value;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : undefined;
  };

  const getDateValueProps = (value: any, def: FormDef) => {
    if (!DATE_TYPES.includes(def.type)) return { value };
    if (!value) return { value: null };
    const parsed = dayjs(value);
    return { value: parsed.isValid() ? parsed : null };
  };

  return (
    <View className={clsx("w-full h-full", className)}>
      <ScrollView className="w-full h-full p-2">
        <Form
          form={usedForm}
          name={`dynamic_form_${table}`}
          {...layout}
          layout="vertical"
          onValuesChange={(changed, all) => console.log("Form Values:", all)}
        >
          {formDefs
            .filter((col) => !col.read_only)
            .map((def) => (
              <Form.Item
                key={def.field}
                label={def.label}
                name={def.field}
                rules={[{ required: def.required }]}
                normalize={(val) => normalizeDate(val, def)}
                getValueProps={(val) => getDateValueProps(val, def)}
              >
                {renderInput(def)}
              </Form.Item>
            ))}
        </Form>
      </ScrollView>
    </View>
  );
}

export default InputForm;
