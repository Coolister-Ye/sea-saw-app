import * as Yup from 'yup';
import { toCamelCase } from "./commonUtils"

export function validator(fields: any[]) {
    const fieldValidator: { [key: string]: Yup.AnySchema } = {};  // 定义 fieldValidator 类型
    for (let field of fields) {
        const fieldName = toCamelCase(field.field_name);
        let validator: Yup.AnySchema | null = null;  // 定义 validator 类型
        if (field.field_type === "text") {
            validator = Yup.string();
        } else if (field.field_type === "email") {
            validator = Yup.string().email('Invalid email address');
        } else if (field.field_type === "phone") {
            validator = Yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid');
        } else if (field.field_type === "date") {
            validator = Yup.string().matches(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/, 'Date must be in the format yyyy/mm/dd or yyyy-mm-dd');
        }

        if (field.is_active && field.is_mandatory) {
            validator = validator?.required("Required");
        }
        if (validator) {
            fieldValidator[fieldName] = validator;
        }
    }
    return Yup.object().shape(fieldValidator);  // 需要使用 shape() 来创建验证对象
}