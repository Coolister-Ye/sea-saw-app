import InputForm, { FormDef } from "@/components/sea-saw-design/form/InputForm";
import ModalForm from "./ModalForm";

function Product({
  def,
  value,
  onChange,
}: {
  def: FormDef;
  value?: any[];
  onChange?: (v: any[]) => void;
}) {
  return (
    <ModalForm
      entityName="products"
      def={def.child?.children}
      value={value}
      onChange={onChange}
      renderForm={(form, def) => (
        <InputForm table="product" def={def} form={form} />
      )}
    />
  );
}

export { Product };
export default Product;
