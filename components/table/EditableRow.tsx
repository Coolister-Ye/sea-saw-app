import { createContext } from "react";
import { Form, FormInstance } from "antd";

// EditableRowProps 接口定义了 EditableRow 组件的属性类型
interface EditableRowProps {
  index: number; // 行的索引
  [key: string]: any; // 其他动态属性
}

// 创建一个 EditableContext，上下文用来传递 Form 实例
export const EditableContext = createContext<FormInstance<any> | null>(null);

const EditableRow = ({ index, ...props }: EditableRowProps) => {
  const [form] = Form.useForm(); // 创建一个表单实例

  return (
    // 使用 Ant Design 的 Form 组件，设置 component={false} 来避免自动渲染表单标签
    <Form form={form} component={false} autoComplete="on">
      {/* 使用 EditableContext.Provider 提供 Form 实例给子组件 */}
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

export default EditableRow;
