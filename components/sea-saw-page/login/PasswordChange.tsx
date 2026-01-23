import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { Formik } from "formik";
import { InputGroup } from "@/components/sea-saw-page/login/InputGroup";
import { Button } from "@/components/sea-saw-design/button";
import * as Yup from "yup";
import YupPassword from "yup-password";
import { useAuthStore, selectLoading } from "@/stores/authStore";
import { StyleSheet, Platform } from "react-native";

// Extend Yup with password validation
YupPassword(Yup);

// Password strength calculator
const calculatePasswordStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "#d9d9d9" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: "", color: "#d9d9d9" },
    { score: 1, label: i18n.t("Weak"), color: "#ff4d4f" },
    { score: 2, label: i18n.t("Fair"), color: "#faad14" },
    { score: 3, label: i18n.t("Good"), color: "#1890ff" },
    { score: 4, label: i18n.t("Strong"), color: "#52c41a" },
    { score: 5, label: i18n.t("Very Strong"), color: "#389e0d" },
  ];

  return levels[Math.min(score, 5)];
};

export function PasswordChange() {
  const setPassword = useAuthStore((state) => state.setPassword);
  const loading = useAuthStore(selectLoading);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "#d9d9d9",
  });

  return (
    <View className="flex-1 relative" style={styles.container}>
      <View className="flex md:flex-row flex-1 flex-wrap relative px-6 py-12 md:px-16 md:py-20">
        {/* Left Column - Title & Description */}
        <View className="w-full mb-12 md:mb-0 md:w-5/12 md:pr-16">
          <View className="relative">
            {/* Decorative accent */}
            <View
              className="absolute -left-4 top-0 w-1 h-24 rounded-full"
              style={styles.accentBar}
            />

            <Text
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
              style={styles.headline}
            >
              {i18n.t("Change password")}
            </Text>

            <View className="w-16 h-0.5 mb-6" style={styles.divider} />

            <Text className="text-lg leading-relaxed mb-8" style={styles.description}>
              {i18n.t("Update your password associated with your account")}
            </Text>

            {/* Security notice card */}
            <View className="p-6 rounded-xl" style={styles.securityCard}>
              <View className="flex-row items-start mb-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-4"
                  style={styles.iconCircle}
                >
                  <Text className="text-xl">🔐</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold mb-2" style={styles.securityTitle}>
                    {i18n.t("Security Requirements")}
                  </Text>
                  <Text className="text-sm leading-relaxed" style={styles.securityText}>
                    {i18n.t(
                      "Passwords must contain at least 8 characters including uppercase, lowercase, numbers, and special characters.",
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional tip - desktop only */}
            {Platform.OS === "web" && (
              <View className="mt-8 flex-row items-start opacity-60">
                <Text className="text-2xl mr-3">💡</Text>
                <Text className="text-sm leading-relaxed flex-1" style={styles.tipText}>
                  {i18n.t(
                    "Tip: Use a unique password that you don't use anywhere else. Consider using a password manager.",
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right Column - Form */}
        <View className="w-full md:w-7/12">
          <View className="rounded-2xl p-8 md:p-12" style={styles.formCard}>
            <Formik
              initialValues={{
                new_password: "",
                current_password: "",
                confirm_password: "",
              }}
              onSubmit={({ new_password, current_password }) =>
                setPassword(new_password, current_password)
              }
              validationSchema={Yup.object({
                new_password: Yup.string()
                  .required(i18n.t("Required"))
                  .password(),
                current_password: Yup.string().required(i18n.t("Required")),
                confirm_password: Yup.string()
                  .required(i18n.t("Required"))
                  .oneOf(
                    [Yup.ref("new_password")],
                    i18n.t("Passwords must match"),
                  ),
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
                <View>
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
                    containerClassName="mb-6"
                  />

                  <InputGroup
                    label={i18n.t("New Password")}
                    secureTextEntry
                    placeholder={i18n.t("Enter new password")}
                    autoComplete="new-password"
                    onChangeText={(text) => {
                      handleChange("new_password")(text);
                      setPasswordStrength(calculatePasswordStrength(text));
                    }}
                    onBlur={handleBlur("new_password")}
                    value={values.new_password}
                    error={touched.new_password && errors.new_password}
                    isMandatory={true}
                    containerClassName="mb-4"
                  />

                  {/* Password strength indicator */}
                  {values.new_password && (
                    <View className="mb-6 mt-2">
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xs font-semibold tracking-wider uppercase" style={styles.strengthLabel}>
                          {i18n.t("Password Strength")}
                        </Text>
                        <View
                          className="px-3 py-1.5 rounded"
                          style={[
                            styles.strengthBadge,
                            { backgroundColor: passwordStrength.color + "15" },
                          ]}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={[styles.strengthText, { color: passwordStrength.color }]}
                          >
                            {passwordStrength.label}
                          </Text>
                        </View>
                      </View>

                      {/* Strength bar */}
                      <View className="h-2 bg-gray-100 dark:bg-gray-700/30 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </View>
                    </View>
                  )}

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
                    containerClassName="mb-10"
                  />

                  <Button
                    type="primary"
                    size="large"
                    onPress={() => handleSubmit()}
                    className="w-full py-4 rounded-lg"
                    loading={loading}
                    style={styles.submitButton}
                  >
                    <Text className="text-base font-semibold" style={styles.buttonText}>
                      {i18n.t("Confirm")}
                    </Text>
                  </Button>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fafafa",
  },
  accentBar: {
    backgroundColor: "#1890ff",
    shadowColor: "#1890ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headline: {
    fontFamily: Platform.select({
      default: "system-ui, -apple-system",
    }),
    color: "#262626",
    fontWeight: "700",
  },
  divider: {
    backgroundColor: "#1890ff",
  },
  description: {
    color: "#595959",
  },
  securityCard: {
    backgroundColor: "#e6f7ff",
    borderWidth: 1,
    borderColor: "#91d5ff",
  },
  iconCircle: {
    backgroundColor: "#1890ff20",
  },
  securityTitle: {
    color: "#0050b3",
  },
  securityText: {
    color: "#096dd9",
  },
  tipText: {
    color: "#8c8c8c",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  strengthLabel: {
    color: "#8c8c8c",
  },
  strengthBadge: {
    borderRadius: 4,
  },
  strengthText: {},
  submitButton: {
    backgroundColor: "#1890ff",
    borderRadius: 8,
    shadowColor: "#1890ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#ffffff",
  },
});
