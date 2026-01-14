import View from "@/components/themed/View";
import { Formik } from "formik";
import { splitAndUpperCaseString, toCamelCase } from "@/utils";
import Button from "@/components/themed/Button";
import Text from "@/components/themed/Text";
import clsx from "clsx";
import { ScrollView } from "react-native-gesture-handler";
import { validator } from "@/utils/validator";
import InputGroup, { InputGroupProps } from "./InputGroup";

export type FormProps = {
  title: string;
  fields: Array<{
    field_name: string;
    field_type: keyof typeof fieldToInputGroup;
    is_mandatory?: boolean;
    id: string | number; // Assuming id can be string or number
  }>;
  data?: any,
  onSubmit?: (values: Record<string, any>) => void;
  onCancel?: () => void;
};

const fieldToInputGroup: Record<string, InputGroupProps["variant"]> = {
  date: "date-picker",
  text: "text-input",
  email: "text-input",
  phone: "text-input",
  picklist: "select-list",
};

const WriteForm: React.FC<FormProps> = ({
  title,
  fields,
  data,
  onSubmit,
  onCancel,
}) => {
  // Generate initial values from fields
  const initialValues = Object.fromEntries(
    fields.map((field) => {
      const value = data && data[field.field_name];
      return [toCamelCase(field.field_name), value || ""]
    })
  );

  const commonClassName = clsx(
    "bg-neutral-50 px-5 py-3 ring-1 ring-inset ring-neutral-200"
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validator(fields)}
      onSubmit={(values) => {
        if (onSubmit) {
          onSubmit(values);
        }
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <View className="w-full h-full flex-1 justify-between">
          <View className="flex-1">
            {/* Header */}
            <View className={clsx(commonClassName, "mb-2")}>
              <Text className="text-2xl">{title}</Text>
            </View>

            {/* Input form */}
            <View className="px-5 py-3 flex-1">
              <ScrollView>
                {fields.map((field) => {
                  const fieldName = toCamelCase(field.field_name);
                  const fieldLabel = splitAndUpperCaseString(field.field_name);
                  const inputGroupVariant = fieldToInputGroup[field.field_type];

                  if (!inputGroupVariant) {
                    console.warn(`Unsupported field type: ${field.field_type}`);
                    return null; // Handle unsupported field type
                  }

                  return (
                    <InputGroup
                      key={field.id}
                      label={fieldLabel}
                      variant={inputGroupVariant}
                      onChangeText={handleChange(fieldName)}
                      onBlur={handleBlur(fieldName)}
                      value={values[fieldName]}
                      isMandatory={field.is_mandatory}
                      error={touched[fieldName] && errors[fieldName]}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Footer for buttons */}
          <View className={clsx("flex flex-row justify-end w-full", commonClassName)}>
            <Button
              variant="outlined"
              className="px-3.5 py-2.5 text-sm font-semibold mr-1 rounded-2xl hover:bg-neutral-100"
              onPress={onCancel}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              className="px-3.5 py-2.5 text-sm font-semibold rounded-2xl"
              onPress={() => handleSubmit()}
            >
              Save
            </Button>
          </View>
        </View>
      )}
    </Formik>
  );
};

export default WriteForm;