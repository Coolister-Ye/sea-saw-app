import * as Yup from "yup";
import { toCamelCase } from "./string";

/**
 * Create a Yup validation schema from field definitions
 * @param fields - Array of field definitions
 * @returns Yup object schema
 */
export function validator(fields: any[]) {
  const fieldValidator: { [key: string]: Yup.AnySchema } = {};

  for (let field of fields) {
    const fieldName = toCamelCase(field.field_name);
    let validator: Yup.AnySchema | null = null;

    if (field.field_type === "text") {
      validator = Yup.string();
    } else if (field.field_type === "email") {
      validator = Yup.string().email("Invalid email address");
    } else if (field.field_type === "phone") {
      validator = Yup.string().matches(
        /^\+?[1-9]\d{1,14}$/,
        "Phone number is not valid"
      );
    } else if (field.field_type === "date") {
      validator = Yup.string().matches(
        /^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/,
        "Date must be in the format yyyy/mm/dd or yyyy-mm-dd"
      );
    }

    if (field.is_active && field.is_mandatory) {
      validator = validator?.required("Required");
    }

    if (validator) {
      fieldValidator[fieldName] = validator;
    }
  }

  return Yup.object().shape(fieldValidator);
}
