import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { AccountPopover } from "@/components/sea-saw-page/crm/account/display";

interface Account {
  id?: string | number;
  pk?: string | number;
  account_name: string;
  address?: string;
  roles?: string[];
}

function AccountCell(props: CustomCellRendererProps) {
  const value: Account = props.value ?? {};
  const meta: any = props.context?.meta ?? {};
  const def = meta.account?.children;

  return <AccountPopover value={value} def={def} />;
}

export default AccountCell;
export { AccountCell };
