import { StandardCRUDPage } from "@/components/sea-saw-page/base/StandardCRUDPage";
import BankAccountTable from "@/components/sea-saw-page/crm/bank-account/table/BankAccountTable";
import BankAccountFormInput from "@/components/sea-saw-page/crm/bank-account/input/BankAccountFormInput";
import { BankAccountDisplay } from "@/components/sea-saw-page/crm/bank-account/display";
import { BankAccountSearch } from "@/components/sea-saw-page/crm/bank-account/search/BankAccountSearch";

const DEFAULT_COL_ORDER = [
  "id",
  "account_holder",
  "bank_name",
  "account_number",
  "currency",
  "swift_code",
  "branch",
  "bank_address",
  "is_primary",
];

export default function BankAccountScreen() {
  return (
    <StandardCRUDPage
      entity="bankAccount"
      nameField="bank_name"
      enableDelete
      columnOrder={DEFAULT_COL_ORDER}
      SearchComponent={BankAccountSearch}
      FormInputComponent={BankAccountFormInput}
      DisplayComponent={BankAccountDisplay}
      TableComponent={BankAccountTable}
    />
  );
}
