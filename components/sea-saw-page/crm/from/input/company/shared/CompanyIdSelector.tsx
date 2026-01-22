import React from "react";
import { Form } from "antd";
import CompanySelector from "./CompanySelector";
import { FormDef } from "@/hooks/useFormDefs";

interface CompanyIdSelectorProps {
  def?: FormDef;
  value?: number | string;
  onChange?: (id: number | string | null) => void;
}

/**
 * CompanyIdSelector - Wraps CompanySelector to work with company_id field
 *
 * This component bridges the gap between:
 * - CompanySelector (expects/returns Company objects)
 * - Form field company_id (expects/returns ID numbers)
 *
 * It automatically syncs both 'company' and 'company_id' form fields.
 */
export default function CompanyIdSelector({
  def,
  value,
  onChange,
}: CompanyIdSelectorProps) {
  const form = Form.useFormInstance();

  // Get company object from form for display
  const companyValue = form.getFieldValue("company");

  const handleChange = (company: any) => {
    const id = company?.id ?? company?.pk;

    // Sync both fields in the form
    form.setFieldsValue({
      company: company,
      company_id: id,
    });

    // Notify parent of ID change
    onChange?.(id);
  };

  return (
    <CompanySelector
      def={def}
      value={companyValue}
      onChange={handleChange}
    />
  );
}
