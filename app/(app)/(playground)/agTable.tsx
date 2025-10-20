import Table from "@/components/sea-saw-design/table";
import { themeBalham } from "ag-grid-community";

export default function AGTable() {
  const myTableTheme = themeBalham.withParams({
    columnBorder: { style: "solid" },
  });
  return <Table table="contact" theme={myTableTheme} />;
}
