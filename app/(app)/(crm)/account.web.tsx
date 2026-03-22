import {
  StandardCRUDPage,
  type FormInputSlotProps,
  type DisplaySlotProps,
} from "@/components/sea-saw-page/base/StandardCRUDPage";
import AccountTable from "@/components/sea-saw-page/crm/account/table/AccountTable";
import AccountFormInput from "@/components/sea-saw-page/crm/account/input/AccountFormInput";
import AccountDisplay from "@/components/sea-saw-page/crm/account/display/AccountDisplay";
import { AccountSearch } from "@/components/sea-saw-page/crm/account/search/AccountSearch";

const DEFAULT_COL_ORDER = [
  "id",
  "account_name",
  "email",
  "mobile",
  "phone",
  "address",
  "website",
  "industry",
  "roles",
  "description",
  "contacts",
];

// 注入 columnOrder 的薄包装组件
const AccountFormInputSlot = (props: FormInputSlotProps) => (
  <AccountFormInput {...props} columnOrder={DEFAULT_COL_ORDER} />
);
const AccountDisplaySlot = (props: DisplaySlotProps) => (
  <AccountDisplay {...props} columnOrder={DEFAULT_COL_ORDER} />
);

export default function AccountScreen() {
  return (
    <StandardCRUDPage
      entity="account"
      nameField="account_name"
      enableDelete
      columnOrder={DEFAULT_COL_ORDER}
      SearchComponent={AccountSearch}
      FormInputComponent={AccountFormInputSlot}
      DisplayComponent={AccountDisplaySlot}
      TableComponent={AccountTable}
    />
  );
}
