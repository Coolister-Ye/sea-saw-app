import React, { forwardRef, useCallback } from "react";
import { View } from "react-native";
import { Form } from "antd";

import EntitySelector from "@/components/sea-saw-design/selector/EntitySelector";
import type { FormDef } from "@/hooks/useFormDefs";
import i18n from "@/locale/i18n";

import { ContactChip } from "./ContactChip";
import type { Contact } from "./types";

interface ContactSelectorProps {
  def?: FormDef;
  value?: Contact | Contact[] | null;
  onChange?: (v: Contact | Contact[] | null) => void;
  multiple?: boolean;
  fieldName?: string;
  idFieldName?: string;
  /** Controlled open state */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the trigger input */
  hideTrigger?: boolean;
}

const ContactSelector = forwardRef<View, ContactSelectorProps>(
  (
    {
      def,
      value,
      onChange,
      multiple = false,
      fieldName = "contact",
      idFieldName = "contact_id",
      open,
      onOpenChange,
      hideTrigger,
    },
    ref,
  ) => {
    const form = Form.useFormInstance();
    const readOnly = def?.read_only;
    const chipDef = def?.children;

    const renderSelectedChip = useCallback(
      (item: Contact, onRemove: () => void) => (
        <ContactChip item={item} def={chipDef} onRemove={onRemove} readOnly={readOnly} />
      ),
      [chipDef, readOnly],
    );

    const handleChange = useCallback(
      (val: Contact | Contact[] | null) => {
        if (!form) {
          onChange?.(val);
          return;
        }

        const fieldValues = multiple
          ? {
              [fieldName]: val,
              [idFieldName]: (val as Contact[] | null)?.map((c) => c.id),
            }
          : {
              [fieldName]: val,
              [idFieldName]: (val as Contact | null)?.id ?? null,
            };

        form.setFieldsValue(fieldValues);
        onChange?.(val);
      },
      [form, multiple, onChange, fieldName, idFieldName],
    );

    return (
      <EntitySelector<Contact>
        ref={ref}
        def={def}
        value={value}
        onChange={handleChange}
        multiple={multiple}
        contentType="contact"
        displayField="name"
        searchPlaceholder={i18n.t("Search contact...")}
        title={i18n.t("Select Contact")}
        renderSelectedChip={renderSelectedChip}
        open={open}
        onOpenChange={onOpenChange}
        hideTrigger={hideTrigger}
      />
    );
  },
);

ContactSelector.displayName = "ContactSelector";

export default ContactSelector;
export { ContactSelector };
