import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { Platform, Alert, Pressable } from "react-native";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { Formik } from "formik";
import LoginInputGroup from "@/components/sea-saw-page/login/InputGroup";
import AuthLayout from "@/components/sea-saw-page/auth/AuthLayout";
import { Button } from "@/components/sea-saw-design/button";
import { Divider } from "@/components/sea-saw-design/divider";
import * as Yup from "yup";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, Link } from "expo-router";
import { message } from "antd";

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  // Use Ant Design message for web
  const [messageApi, contextHolder] =
    Platform.OS === "web" ? message.useMessage() : [null, null];

  const [loading, setLoading] = useState(false);

  // Helper to show messages on both web and native
  const showMessage = (
    msg: string,
    type: "error" | "success" | "warning" = "error",
  ) => {
    if (Platform.OS === "web" && messageApi) {
      messageApi[type](msg);
    } else {
      Alert.alert(
        type === "error" ? "Error" : type === "warning" ? "Warning" : "Success",
        msg,
      );
    }
  };

  const handleSubmit = async (values: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    department?: string;
  }) => {
    setLoading(true);
    try {
      const response = await register(values);
      if (response.status) {
        showMessage(
          i18n.t("Registration successful! Please log in."),
          "success",
        );
        // Redirect to login page after successful registration
        router.replace("/login");
      } else {
        showMessage(
          response.errorMsg || i18n.t("Registration failed, please try again."),
          "error",
        );
      }
    } catch (error) {
      showMessage(i18n.t("Registration failed, please try again."), "error");
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validationSchema = Yup.object({
    username: Yup.string()
      .required(i18n.t("Required"))
      .min(3, i18n.t("Username must be at least 3 characters")),
    email: Yup.string()
      .email(i18n.t("Invalid email address"))
      .required(i18n.t("Required")),
    password: Yup.string()
      .required(i18n.t("Required"))
      .min(8, i18n.t("Password must be at least 8 characters")),
    password_confirm: Yup.string()
      .required(i18n.t("Required"))
      .oneOf([Yup.ref("password")], i18n.t("Passwords must match")),
    first_name: Yup.string(),
    last_name: Yup.string(),
    phone: Yup.string(),
    department: Yup.string(),
  });

  return (
    <AuthLayout
      heroTitle={i18n.t("Join")}
      heroSubtitle={i18n.t(
        "Start managing your business more efficiently with our comprehensive CRM solution",
      )}
      features={[
        i18n.t("Easy Setup"),
        i18n.t("Free Trial"),
        i18n.t("24/7 Support"),
      ]}
      themeColor="green"
      contextHolder={contextHolder}
    >
      {/* Form header */}
      <View className="mb-8">
        <Text className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
          {i18n.t("Create your account")}
        </Text>
        <Text className="text-base text-slate-600 dark:text-slate-400">
          {i18n.t("Fill in your details to get started")}
        </Text>
      </View>

      {/* Form */}
      <Formik
        initialValues={{
          username: "",
          email: "",
          password: "",
          password_confirm: "",
          first_name: "",
          last_name: "",
          phone: "",
          department: "",
        }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
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
            {/* Required fields */}
            <View className="mb-5">
              <LoginInputGroup
                label={i18n.t("Username")}
                placeholder={i18n.t("Enter username")}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                value={values.username}
                error={touched.username && errors.username}
              />
            </View>

            <View className="mb-5">
              <LoginInputGroup
                label={i18n.t("Email")}
                placeholder={i18n.t("Enter email")}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                error={touched.email && errors.email}
              />
            </View>

            <View className="mb-5">
              <LoginInputGroup
                label={i18n.t("Password")}
                secureTextEntry
                placeholder={i18n.t("Enter password")}
                autoComplete="new-password"
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                error={touched.password && errors.password}
              />
            </View>

            <View className="mb-6">
              <LoginInputGroup
                label={i18n.t("Confirm Password")}
                secureTextEntry
                placeholder={i18n.t("Confirm password")}
                autoComplete="new-password"
                onChangeText={handleChange("password_confirm")}
                onBlur={handleBlur("password_confirm")}
                value={values.password_confirm}
                error={
                  touched.password_confirm && errors.password_confirm
                }
              />
            </View>

            {/* Optional fields divider */}
            <Divider
              plain
              className="mb-5"
              textClassName="text-xs uppercase tracking-wider"
            >
              {i18n.t("Optional Information")}
            </Divider>

            {/* Two columns for optional fields on larger screens */}
            <View className="flex flex-col lg:flex-row lg:gap-4">
              <View className="flex-1 mb-5">
                <LoginInputGroup
                  label={i18n.t("First Name")}
                  placeholder={i18n.t("Enter first name")}
                  onChangeText={handleChange("first_name")}
                  onBlur={handleBlur("first_name")}
                  value={values.first_name}
                  error={touched.first_name && errors.first_name}
                />
              </View>

              <View className="flex-1 mb-5">
                <LoginInputGroup
                  label={i18n.t("Last Name")}
                  placeholder={i18n.t("Enter last name")}
                  onChangeText={handleChange("last_name")}
                  onBlur={handleBlur("last_name")}
                  value={values.last_name}
                  error={touched.last_name && errors.last_name}
                />
              </View>
            </View>

            <View className="flex flex-col lg:flex-row lg:gap-4">
              <View className="flex-1 mb-5">
                <LoginInputGroup
                  label={i18n.t("Phone")}
                  placeholder={i18n.t("Enter phone number")}
                  keyboardType="phone-pad"
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                  error={touched.phone && errors.phone}
                />
              </View>

              <View className="flex-1 mb-6">
                <LoginInputGroup
                  label={i18n.t("Department")}
                  placeholder={i18n.t("Enter department")}
                  onChangeText={handleChange("department")}
                  onBlur={handleBlur("department")}
                  value={values.department}
                  error={touched.department && errors.department}
                />
              </View>
            </View>

            {/* Register button */}
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onPress={() => handleSubmit()}
            >
              {loading
                ? i18n.t("Creating account...")
                : i18n.t("Create account")}
            </Button>

            {/* Divider */}
            <Divider
              plain
              className="mt-8 mb-6"
              textClassName="text-xs uppercase tracking-wider"
            >
              {i18n.t("or")}
            </Divider>

            {/* Sign in link */}
            <View className="flex flex-row justify-center items-center">
              <Text className="text-sm text-slate-600 dark:text-slate-400">
                {i18n.t("Already have an account?")}{" "}
              </Text>
              <Link href="/login" asChild>
                <Pressable>
                  <Text className="text-sm font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                    {i18n.t("Sign in")}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        )}
      </Formik>

      {/* Footer note */}
      <Text className="mt-10 text-xs text-center text-slate-500 dark:text-slate-500">
        {i18n.t(
          "By creating an account, you agree to our Terms of Service and Privacy Policy",
        )}
      </Text>
    </AuthLayout>
  );
}
