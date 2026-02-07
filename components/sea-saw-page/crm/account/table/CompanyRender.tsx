import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import { CompanyPopover } from "@/components/sea-saw-page/crm/from/display/company";

interface Company {
  id?: string | number;
  pk?: string | number;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
}

function CompanyRender(props: CustomCellRendererProps) {
  const value: Company = props.value ?? {};
  const meta: any = props.context?.meta ?? {};
  const def = meta.company?.children;

  return <CompanyPopover value={value} def={def} />;
}

export default CompanyRender;
export { CompanyRender };
