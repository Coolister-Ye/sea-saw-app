import InputForm from "@/components/sea-saw-design/form/InputForm";
import { FormDef } from "@/hooks/useFormDefs";
import OrderDisplay from "./OrderDisplay";
import Product from "./Product.web";
import ModalForm from "./base/ModalForm.web";

interface OrderProps {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
}

export default function Order({ def, value = [], onChange }: OrderProps) {
  /** 渲染单个订单条目 */
  const renderItem = (item: any, onEdit: any, onDelete: any) => (
    <OrderDisplay def={def} value={item} onEdit={onEdit} />
  );

  /** 渲染 ModalForm 内部表单 */
  const renderForm = (form: any, formDef: any) => (
    <InputForm
      table="order"
      def={formDef}
      form={form}
      config={{
        products: {
          render: (
            fieldDef: FormDef,
            fieldValue: any[],
            fieldOnChange: (v: any[]) => void
          ) => (
            <Product
              def={fieldDef}
              value={fieldValue}
              onChange={fieldOnChange}
            />
          ),
        },
      }}
    />
  );

  return (
    <ModalForm
      entityName="order"
      def={def}
      value={value}
      onChange={onChange}
      renderItem={renderItem}
      renderForm={renderForm}
    />
  );
}
