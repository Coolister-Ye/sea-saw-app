import React from "react";
import type { CustomCellRendererProps } from "ag-grid-react";
import ContactPopover from "@/components/sea-saw-page/crm/from/display/ContactPopover";

interface Contact {
  id?: string | number;
  name: string;
  title?: string;
  email?: string;
  mobile?: string;
  phone?: string;
  company?: {
    company_name?: string;
  };
}

function ContactRender(props: CustomCellRendererProps) {
  const value: Contact = props.value ?? {};
  const meta: any = props.context?.meta ?? {};
  const def = meta.contact?.children;

  return <ContactPopover value={value} def={def} />;
}

export default ContactRender;
export { ContactRender };
