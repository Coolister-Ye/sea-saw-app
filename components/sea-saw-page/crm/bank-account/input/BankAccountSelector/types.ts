import type { EntityItem } from "@/components/sea-saw-design/selector/EntitySelector";
import type { FormDef } from "@/hooks/useFormDefs";

export interface BankAccount extends EntityItem {
  id: string | number;
  pk?: string | number;
  bank_name?: string;
  account_number?: string;
  currency?: string;
  is_primary?: boolean;
}

export interface BankAccountSelectorProps {
  def?: FormDef;
  value?: BankAccount | null;
  onChange?: (value: BankAccount | null) => void;
  fieldName?: string;
  idFieldName?: string;
  queryParams?: Record<string, any>;
}
