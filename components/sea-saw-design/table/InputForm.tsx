import { View, ScrollView } from "react-native";
import { HeaderMetaProps, InputFormProps } from "./interface";
import { useCallback, useEffect, useState } from "react";
import { DatePicker, Form, Input, InputNumber, Select } from "antd";
import useDataService from "@/hooks/useDataService";
import ForeignKeyForm from "./ForeignKeyForm";

type FormDef = HeaderMetaProps & {
  field: string;
};

function InputForm({ table, headerMeta }: InputFormProps) {
  const [formDefs, setFormDefs] = useState<FormDef[]>([]);
  const [form] = Form.useForm();
  const { options } = useDataService();
  const NUMERICAL_TYPES = ["integer", "float", "double", "decimal"];
  const DATE_TYPES = ["date", "datetime"];

  const layout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 6 },
    },
  };

  const getFormDefFromHeaderMeta = (
    headerMeta: Record<string, HeaderMetaProps>
  ) => {
    const formDefs = Object.entries(headerMeta).map(([header, definitions]) => {
      return {
        field: header,
        ...definitions,
      };
    });

    return formDefs;
  };

  const fetchFormDefsFromNetwork = useCallback(async () => {
    try {
      const response = await options({ contentType: table });
      if (!response.status) return [];

      const headerMeta: Record<string, HeaderMetaProps> =
        response.data.actions?.POST;
      return getFormDefFromHeaderMeta(headerMeta);
    } catch (error) {
      console.error("Error fetching column definitions:", error);
      return [];
    }
  }, [options, table]);

  const fetchFormDefsFromLocal = useCallback(() => {
    function isHeaderMetaProps(obj: any): obj is HeaderMetaProps {
      return "children" in obj || "child" in obj;
    }
    if (isHeaderMetaProps(headerMeta))
      return getFormDefFromHeaderMeta(
        headerMeta.children || headerMeta.child?.children || {}
      );
    else {
      return getFormDefFromHeaderMeta(headerMeta || {});
    }
  }, []);

  const fetchFormDefs = useCallback(async () => {
    if (headerMeta) {
      return fetchFormDefsFromLocal();
    } else {
      return fetchFormDefsFromNetwork();
    }
  }, [fetchFormDefsFromLocal, fetchFormDefsFromNetwork, headerMeta]);

  useEffect(() => {
    fetchFormDefs().then((formDefs) => setFormDefs(formDefs));
  }, [headerMeta]);

  const inputComponent = (def: FormDef) => {
    if (def.choices) return <Select options={def.choices} />;
    if (NUMERICAL_TYPES.includes(def.type)) return <InputNumber />;
    if (DATE_TYPES.includes(def.type)) return <DatePicker />;
    if (def.type === "nested object" || def.type === "field")
      return (
        <ForeignKeyForm
          dataType={def}
          field={def.field}
          onChange={(value) => form.setFieldsValue({ [def.field]: value })}
        />
      );
    return <Input />;
  };

  return (
    <View className="w-full h-full">
      <Form
        form={form}
        name="dynamic_form"
        {...layout}
        onValuesChange={(changedValues, allValues) => {
          console.log(allValues);
        }}
      >
        {formDefs
          .filter((col) => col.read_only !== true)
          .map((def, index) => {
            return (
              <Form.Item
                label={def.label}
                name={def.field}
                rules={[{ required: def.required }]}
                key={index}
              >
                {inputComponent(def)}
              </Form.Item>
            );
          })}
      </Form>
    </View>
  );
}

export { InputForm };

export default InputForm;
