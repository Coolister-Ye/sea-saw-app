import {
  StandardCRUDPage,
  type FormInputSlotProps,
  type DisplaySlotProps,
} from "@/components/sea-saw-page/base/StandardCRUDPage";
import UserAdminTable from "@/components/sea-saw-page/admin/user/table/UserAdminTable";
import UserAdminFormInput from "@/components/sea-saw-page/admin/user/input/UserAdminFormInput";
import UserAdminDisplay from "@/components/sea-saw-page/admin/user/display/UserAdminDisplay";
import { UserAdminSearch } from "@/components/sea-saw-page/admin/user/search/UserAdminSearch";

const COL_ORDER = [
  "id",
  "username",
  "first_name",
  "last_name",
  "email",
  "department",
  "role",
  "is_staff",
  "is_active",
  "date_joined",
];

const UserAdminFormInputSlot = (props: FormInputSlotProps) => (
  <UserAdminFormInput {...props} columnOrder={COL_ORDER} />
);
const UserAdminDisplaySlot = (props: DisplaySlotProps) => (
  <UserAdminDisplay {...props} columnOrder={COL_ORDER} />
);

export default function UsersScreen() {
  return (
    <StandardCRUDPage
      entity="adminUser"
      nameField="username"
      enableDelete
      columnOrder={COL_ORDER}
      SearchComponent={UserAdminSearch}
      FormInputComponent={UserAdminFormInputSlot}
      DisplayComponent={UserAdminDisplaySlot}
      TableComponent={UserAdminTable}
    />
  );
}
