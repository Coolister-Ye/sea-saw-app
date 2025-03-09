import { createContext, useRef } from "react";
import { Form, FormInstance } from "antd";

interface EditableRowProps {
  index: number; // 行的索引
  record: Record<string, any>;
  formula?: Record<string, (inputs: Record<string, any>) => any>; // 公式配置
  [key: string]: any; // 其他动态属性
}

// 创建一个 EditableContext，上下文用来传递 Form 实例
export const EditableContext = createContext<{
  form: FormInstance<any>;
  recordRef: any;
}>({
  form: {} as FormInstance,
  recordRef: {},
});

const EditableRow = ({
  index,
  record,
  formula,
  ...props
}: EditableRowProps) => {
  const [form] = Form.useForm(); // 创建一个表单实例
  const recordRef = useRef<Record<string, any>>(record);

  const onValuesChange = (
    changedValues: Record<string, any>,
    allValues: Record<string, any>
  ) => {
    if (formula && typeof formula === "object") {
      Object.entries(formula).forEach(([outputField, compute]) => {
        if (typeof compute === "function") {
          // allValues only contains value which is editable,
          // merge record data to inclue all original data record
          const calculatedValue = compute({ ...record, ...allValues });
          if (calculatedValue !== undefined) {
            form.setFieldsValue({ [outputField]: calculatedValue });
          }
        }
      });
    }
  };

  return (
    <Form
      form={form}
      component={false}
      autoComplete="on"
      onValuesChange={onValuesChange}
    >
      <EditableContext.Provider value={{ form, recordRef }}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export default EditableRow;
