import React, { useState, useEffect } from "react";
import i18n from "@/locale/i18n";
import { Pressable, StyleSheet, Platform, Alert } from "react-native";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { Button } from "@/components/sea-saw-design/button";
import { Divider } from "@/components/sea-saw-design/divider";

import { Formik } from "formik";
import Checkbox from "expo-checkbox";
import LoginInputGroup from "@/components/sea-saw-page/login/InputGroup";
import AuthLayout from "@/components/sea-saw-page/auth/AuthLayout";
import * as Yup from "yup";
import { useAuthStore } from "@/stores/authStore";
import { getLocalData, setLocalData, removeLocalData } from "@/utils";
import { useLocalSearchParams, useRouter, Href, Link } from "expo-router";
import { message } from "antd";

// Define constants
const REMEMBER_NAME = "remember-me";
const CREDENTIAL_NAME = "credentials";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();

  // Use Ant Design message for web
  const [messageApi, contextHolder] =
    Platform.OS === "web" ? message.useMessage() : [null, null];

  const [isRemember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

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

  // Automatically load saved credentials
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const isRemember = await getLocalData(REMEMBER_NAME);
        if (isRemember) {
          const credentials = await getLocalData<{
            username: string;
            password: string;
          }>(CREDENTIAL_NAME);

          if (credentials) {
            setSavedCredentials(credentials);
            setRemember(true);
          }
        }
      } catch (error) {
        console.error("Error loading saved credentials:", error);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleSubmit = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const response = await login(username, password);
      if (response.status) {
        // Save credentials if remember me
        if (isRemember) {
          await setLocalData(CREDENTIAL_NAME, { username, password });
        } else {
          await removeLocalData(CREDENTIAL_NAME);
        }

        // Redirect to next param or home
        router.replace((next as Href) || "/");
      } else {
        showMessage(
          response.errorMsg || i18n.t("Login failed, please try again."),
          "error",
        );
      }
    } catch (error) {
      showMessage(i18n.t("Login failed, please try again."), "error");
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validationSchema = Yup.object({
    username: Yup.string().required(i18n.t("Required")),
    password: Yup.string().required(i18n.t("Required")),
  });

  return (
    <AuthLayout
      heroTitle={i18n.t("Welcome to")}
      heroSubtitle={i18n.t(
        "Streamline your business operations with intelligent customer relationship management",
      )}
      features={[
        i18n.t("Smart Analytics"),
        i18n.t("Real-time Sync"),
        i18n.t("Secure Access"),
      ]}
      themeColor="blue"
      contextHolder={contextHolder}
    >
      {/* Form header */}
      <View className="mb-10">
              <Text className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
                {i18n.t("Sign in")}
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-400">
                {i18n.t("Enter your credentials to access your account")}
              </Text>
            </View>

            {/* Form */}
            <Formik
              initialValues={{
                username: savedCredentials?.username || "",
                password: savedCredentials?.password || "",
              }}
              enableReinitialize
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
                  <View className="mb-6">
                    <LoginInputGroup
                      label={i18n.t("Username")}
                      placeholder={i18n.t("Enter username")}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      value={values.username}
                      error={touched.username && errors.username}
                    />
                  </View>

                  <View className="mb-6">
                    <LoginInputGroup
                      label={i18n.t("Password")}
                      secureTextEntry
                      placeholder={i18n.t("Enter password")}
                      autoComplete="current-password"
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                      error={touched.password && errors.password}
                    />
                  </View>

                  {/* Remember me & Forgot password */}
                  <View className="flex flex-row items-center justify-between mb-8">
                    <Pressable
                      className="flex flex-row items-center"
                      onPress={() => setRemember((prev) => !prev)}
                    >
                      <Checkbox
                        value={isRemember}
                        onValueChange={() => setRemember((prev) => !prev)}
                        style={styles.checkbox}
                        color={isRemember ? "#2563eb" : undefined}
                      />
                      <Text className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                        {i18n.t("Remember me")}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        showMessage(
                          i18n.t("Contact admin to change password"),
                          "warning",
                        )
                      }
                    >
                      <Text className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                        {i18n.t("Forgot password?")}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Sign in button */}
                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={loading}
                    onPress={() => handleSubmit()}
                  >
                    {loading ? i18n.t("Signing in...") : i18n.t("Sign in")}
                  </Button>

                  {/* Divider */}
                  <Divider
                    plain
                    className="mt-8 mb-6"
                    textClassName="text-xs uppercase tracking-wider"
                  >
                    {i18n.t("or")}
                  </Divider>

                  {/* Register link */}
                  <View className="flex flex-row justify-center items-center">
                    <Text className="text-sm text-slate-600 dark:text-slate-400">
                      {i18n.t("Don't have an account?")}{" "}
                    </Text>
                    <Link href="/register" asChild>
                      <Pressable>
                        <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          {i18n.t("Create account")}
                        </Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
              )}
            </Formik>

            {/* Footer note */}
            <Text className="mt-12 text-xs text-center text-slate-500 dark:text-slate-500">
        {i18n.t(
          "By signing in, you agree to our Terms of Service and Privacy Policy",
        )}
      </Text>
    </AuthLayout>
  );
}

// Styles
const styles = StyleSheet.create({
  checkbox: {
    height: 18,
    width: 18,
    borderRadius: 4,
    borderColor: "#cbd5e1",
    borderWidth: 1.5,
  },
});
