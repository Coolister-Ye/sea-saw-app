import React from "react";
import View from "@/components/themed/View";
import Text from "@/components/themed/Text";
import { Formik } from "formik";
import { InputGroup } from "@/components/sea/login/InputGroup";
import { Button } from "@/components/themed/Button";
import * as Yup from "yup";
import YupPassword from "yup-password";
import { useAuth } from "@/context/Auth";
import { useLocale } from "@/context/Locale";

// Extend Yup with password validation
YupPassword(Yup); // Extend Yup with password rules

// Password change screen component
export default function SetPasswdScreen() {
  const { setPasswd, loading } = useAuth(); // Use setPasswd method from Auth context for password change
  const { i18n } = useLocale(); // Get i18n method for localization

  return (
    <View className="flex-1 relative p-5" variant="paper">
      <View className="w-full md:w-96">
        <Text className="text-base font-bold mt-5" variant="primary">
          {i18n.t("Change Password")}
        </Text>

        {/* Formik form for handling form submission and validation */}
        <Formik
          initialValues={{
            new_password: "",
            current_password: "",
            confirm_password: "",
          }}
          onSubmit={setPasswd} // Call setPasswd on form submit
          validationSchema={Yup.object({
            new_password: Yup.string().required(i18n.t("Required")).password(), // Use yup-password to validate password complexity
            current_password: Yup.string().required(i18n.t("Required")),
            confirm_password: Yup.string()
              .required(i18n.t("Required"))
              .oneOf([Yup.ref("new_password")], i18n.t("Passwords must match")),
          })}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View className="mt-10">
              <InputGroup
                label={i18n.t("Current Password")}
                secureTextEntry
                placeholder={i18n.t("Enter current password")}
                autoComplete="current-password"
                onChangeText={handleChange("current_password")}
                onBlur={handleBlur("current_password")}
                value={values.current_password}
                error={touched.current_password && errors.current_password}
                isMandatory={true}
              />

              <InputGroup
                label={i18n.t("New Password")}
                secureTextEntry
                placeholder={i18n.t("Enter new password")}
                autoComplete="new-password"
                onChangeText={handleChange("new_password")}
                onBlur={handleBlur("new_password")}
                value={values.new_password}
                error={touched.new_password && errors.new_password}
                isMandatory={true}
              />

              <InputGroup
                label={i18n.t("Confirm Password")}
                secureTextEntry
                placeholder={i18n.t("Confirm new password")}
                autoComplete="new-password"
                onChangeText={handleChange("confirm_password")}
                onBlur={handleBlur("confirm_password")}
                value={values.confirm_password}
                error={touched.confirm_password && errors.confirm_password}
                isMandatory={true}
              />

              <Button
                variant="primary"
                onPress={() => handleSubmit()}
                className="mt-6 w-fit rounded-md px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-sm"
                loading={loading}
              >
                {i18n.t("Confirm")}
              </Button>
            </View>
          )}
        </Formik>
      </View>
    </View>
  );
}
