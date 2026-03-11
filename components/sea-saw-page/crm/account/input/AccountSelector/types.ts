import type { EntityItem } from "@/components/sea-saw-design/selector/EntitySelector";
import type { FormDef } from "@/hooks/useFormDefs";

export type AccountRole = "CUSTOMER" | "SUPPLIER" | "PROSPECT";

export interface Account extends EntityItem {
  id: string | number;
  pk?: string | number;
  account_name: string;
  address?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  industry?: string;
  description?: string;
  roles?: AccountRole[];
}

export interface AccountSelectorProps {
  def?: FormDef;
  value?: Account | Account[] | null;
  onChange?: (v: Account | Account[] | null) => void;
  multiple?: boolean;
  roleFilter?: "customer" | "supplier" | "prospect";
  /** Form field name for the account object (default: "account") */
  fieldName?: string;
  /** Form field name for the account id (default: "account_id") */
  idFieldName?: string;
}

export interface AccountApiResponse {
  results: Array<{
    pk?: string | number;
    id?: string | number;
    account_name?: string;
    address?: string;
    phone?: string;
    mobile?: string;
    email?: string;
    website?: string;
    industry?: string;
    description?: string;
    roles?: AccountRole[];
  }>;
}
