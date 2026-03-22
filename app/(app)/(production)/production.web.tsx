import { stripIdsDeep } from "@/utils";
import {
  StandardCRUDPage,
  type FormInputSlotProps,
  type TableSlotProps,
} from "@/components/sea-saw-page/base/StandardCRUDPage";
import ProductionTable from "@/components/sea-saw-page/production/production-order/table/ProductionTable";
import ProductionOrderInput from "@/components/sea-saw-page/production/production-order/input/ProductionOrderInput";
import ProductionOrderDisplay from "@/components/sea-saw-page/production/production-order/display/ProductionOrderDisplay";
import ProductionSearch from "@/components/sea-saw-page/production/production-order/search/ProductionSearch";

// ProductionOrderInput 需要 mode="standalone"
const ProductionFormInputSlot = (props: FormInputSlotProps) => (
  <ProductionOrderInput mode="standalone" {...props} />
);

// ProductionTable 使用 forwardRef（ref），而 StandardCRUDPage 传 tableRef
const ProductionTableSlot = ({ tableRef, ...props }: TableSlotProps) => (
  <ProductionTable ref={tableRef} {...props} />
);

const buildProductionCopyData = (productionOrder: any) => {
  if (!productionOrder) return null;
  const { id, pk, production_code, created_at, updated_at, ...rest } = productionOrder;
  return stripIdsDeep(rest);
};

export default function ProductionScreen() {
  return (
    <StandardCRUDPage
      entity="productionOrder"
      nameField="production_code"
      buildCopyData={buildProductionCopyData}
      SearchComponent={ProductionSearch}
      FormInputComponent={ProductionFormInputSlot}
      DisplayComponent={ProductionOrderDisplay}
      TableComponent={ProductionTableSlot}
    />
  );
}
