import React, { useState } from "react";
import i18n from "@/locale/i18n";
import { Platform, Alert, ScrollView, StyleSheet, Pressable } from "react-native";
import { View } from "@/components/sea-saw-design/view";
import { Image as ExpoImage } from "expo-image";
import { Text } from "@/components/sea-saw-design/text";
import { Formik } from "formik";
import LoginInputGroup from "@/components/sea-saw-page/login/InputGroup";
import { Button } from "@/components/sea-saw-design/button";
import { Divider } from "@/components/sea-saw-design/divider";
import * as Yup from "yup";
import { useAuthStore } from "@/stores/authStore";
import { useRouter, Link } from "expo-router";
import { message } from "antd";

// Define constants
const APP_NAME = "Sea-Cube ERP";
const APP_LOGO = require("@/assets/images/app-logo.png");

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
    <View className="flex min-h-full flex-1 relative bg-slate-50 dark:bg-slate-950">
      {contextHolder}

      {/* Background decorative elements */}
      <View
        className="absolute inset-0 opacity-30"
        style={styles.gridBackground}
      />
      <View className="absolute inset-0" style={styles.radialGlow} />

      {/* Main content container */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-1 flex-row min-h-full">
          {/* Left side - Hero section (hidden on mobile) */}
          <View className="hidden lg:flex lg:flex-1 relative items-center justify-center px-16 bg-gradient-to-br from-green-600 to-green-800">
            <View className="max-w-lg z-10">
              {/* Logo with white background and glow effect */}
              <View
                className="mb-5 items-center justify-center"
                style={{ width: 120, height: 120 }}
              >
                <View
                  className="bg-white rounded-xl items-center justify-center"
                  style={{
                    width: 100,
                    height: 100,
                    shadowColor: "#fff",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 20,
                    elevation: 10,
                  }}
                >
                  <ExpoImage
                    source={APP_LOGO}
                    style={{ width: 120, aspectRatio: 2.5 }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                </View>
              </View>

              {/* Hero text */}
              <Text className="text-5xl font-bold mb-6 leading-tight text-white">
                {i18n.t("Join")} {"\n"}
                {APP_NAME}
              </Text>

              <Text className="text-lg leading-relaxed text-green-100 mb-12">
                {i18n.t(
                  "Start managing your business more efficiently with our comprehensive CRM solution",
                )}
              </Text>

              {/* Feature highlights */}
              <View className="flex flex-row gap-6">
                <View className="flex-1">
                  <View className="w-12 h-1 mb-3 bg-green-300 rounded-full" />
                  <Text className="text-sm text-green-100 font-medium">
                    {i18n.t("Easy Setup")}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="w-12 h-1 mb-3 bg-green-300 rounded-full" />
                  <Text className="text-sm text-green-100 font-medium">
                    {i18n.t("Free Trial")}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="w-12 h-1 mb-3 bg-green-300 rounded-full" />
                  <Text className="text-sm text-green-100 font-medium">
                    {i18n.t("24/7 Support")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Decorative circles */}
            <View className="absolute top-20 right-20 w-64 h-64 bg-green-500 rounded-full opacity-20 blur-3xl" />
            <View className="absolute bottom-20 left-20 w-48 h-48 bg-green-400 rounded-full opacity-20 blur-3xl" />
          </View>

          {/* Right side - Register form */}
          <View className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 bg-white dark:bg-slate-900">
            <View className="mx-auto w-full max-w-md">
              {/* Mobile logo (visible only on mobile) */}
              <View className="lg:hidden mb-8 items-center">
                <ExpoImage
                  source={APP_LOGO}
                  style={{ width: 120, aspectRatio: 2.5 }}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
              </View>

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
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Styles - Only for web-specific features that can't be done with Tailwind
const styles = StyleSheet.create({
  gridBackground: Platform.select({
    web: {
      backgroundImage:
        "linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    } as any,
    default: {},
  }),
  radialGlow: Platform.select({
    web: {
      backgroundImage:
        "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)",
    } as any,
    default: {},
  }),
});
