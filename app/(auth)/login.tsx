import React, { useState, useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import View from "@/components/themed/View";
import Image from "@/components/themed/Image";
import Text from "@/components/themed/Text";
import { Formik } from "formik";
import Checkbox from "expo-checkbox";
import LoginInputGroup from "@/components/sea-saw-page/login/InputGroup";
import { Button } from "@/components/themed/Button";
import * as Yup from "yup";
import { useAuth } from "@/context/Auth";
import { useLocale } from "@/context/Locale";
import {
  getLocalData,
  setLocalData,
  removeLocalData,
} from "@/utils";
import { useToast } from "@/context/Toast";
import { useLocalSearchParams, useRouter, Href } from "expo-router";

// Define constants
const REMEMBER_NAME = "remember-me";
const CREDENTIAL_NAME = "credentials";

export default function LoginScreen() {
  const { login } = useAuth();
  const { i18n } = useLocale();
  const { showToast } = useToast();
  const router = useRouter();
  const { next } = useLocalSearchParams<{ next?: string }>();

  const [isRemember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);

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
      const response = await login({ username, password });
      if (response.status) {
        // Save credentials if remember me
        if (isRemember) {
          await setLocalData(CREDENTIAL_NAME, { username, password });
        } else {
          await removeLocalData(CREDENTIAL_NAME);
        }

        // Redirect to next param or home
        router.replace((next as Href) || "/");
      }
    } catch (error) {
      showToast({
        message: i18n.t("Login failed, please try again."),
        variant: "error",
      });
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
    <View className="flex min-h-full flex-1 relative" variant="paper">
      {/* Main content */}
      <View className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <View className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and title */}
          <View>
            <Image
              source={require("@/assets/images/app.png")}
              className="h-10 w-10"
            />
            <Text
              className="mt-8 text-2xl font-bold leading-9 tracking-tight"
              variant="primary"
            >
              {i18n.t("Sign in to your account")}
            </Text>
          </View>

          {/* Form */}
          <View className="mt-10">
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
                  <LoginInputGroup
                    label={i18n.t("Username")}
                    placeholder={i18n.t("Enter username")}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    value={values.username}
                    error={touched.username && errors.username}
                  />
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

                  {/* Remember me */}
                  <View className="flex flex-row items-center justify-between mt-6">
                    <View className="flex flex-row items-center">
                      <Checkbox
                        value={isRemember}
                        onValueChange={() => setRemember((prev) => !prev)}
                        style={styles.checkbox}
                        color={isRemember ? "rgb(79 70 229)" : undefined}
                      />
                      <Text
                        variant="primary"
                        className="ml-3 text-sm leading-6"
                      >
                        {i18n.t("Remember me")}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        showToast({
                          message: i18n.t("Contact admin to change password"),
                          variant: "warning",
                        })
                      }
                    >
                      <Text className="font-semibold text-indigo-600 hover:text-indigo-500 text-sm leading-6">
                        {i18n.t("Forgot password?")}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Sign in */}
                  <View className="mt-6">
                    <Button
                      variant="primary"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      className="w-full h-10 justify-center rounded-md px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-sm"
                    >
                      {i18n.t("Sign in")}
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  checkbox: {
    height: 16,
    width: 16,
    borderRadius: 4,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    color: "#4F46E5",
  },
});
