import { StandardCRUDPage } from "@/components/sea-saw-page/base/StandardCRUDPage";
import ContactTable from "@/components/sea-saw-page/crm/contact/table/ContactTable";
import { ContactSearch } from "@/components/sea-saw-page/crm/contact/search/ContactSearch";
import { ContactFormInput } from "@/components/sea-saw-page/crm/contact/input";
import { ContactDisplay } from "@/components/sea-saw-page/crm/contact/display";

export default function ContactScreen() {
  return (
    <StandardCRUDPage
      entity="contact"
      nameField="name"
      enableDelete
      SearchComponent={ContactSearch}
      FormInputComponent={ContactFormInput}
      DisplayComponent={ContactDisplay}
      TableComponent={ContactTable}
    />
  );
}
