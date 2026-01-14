import React from "react";
import { Form } from "antd";
import ContactSelector from "./ContactSelector";
import { FormDef } from "@/hooks/useFormDefs";

interface ContactIdSelectorProps {
  def?: FormDef;
  value?: number | string;
  onChange?: (id: number | string | null) => void;
}

/**
 * ContactIdSelector - Wraps ContactSelector to work with contact_id field
 *
 * This component bridges the gap between:
 * - ContactSelector (expects/returns Contact objects)
 * - Form field contact_id (expects/returns ID numbers)
 *
 * It automatically syncs both 'contact' and 'contact_id' form fields.
 */
export default function ContactIdSelector({
  def,
  value,
  onChange,
}: ContactIdSelectorProps) {
  const form = Form.useFormInstance();

  // Get contact object from form for display
  const contactValue = form.getFieldValue("contact");

  const handleChange = (contacts: any[]) => {
    const contact = contacts[0];
    const id = contact?.id ?? contact?.pk;

    // Sync both fields in the form
    form.setFieldsValue({
      contact: contact,
      contact_id: id,
    });

    // Notify parent of ID change
    onChange?.(id);
  };

  return (
    <ContactSelector
      def={def}
      value={contactValue}
      onChange={handleChange}
    />
  );
}
