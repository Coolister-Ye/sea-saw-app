import React, { useState } from "react";
import i18n from '@/locale/i18n';
import { Platform, Alert, ScrollView } from "react-native";
import View from "@/components/themed/View";
import Image from "@/components/themed/Image";
import Text from "@/components/themed/Text";
import { Formik } from "formik";
import LoginInputGroup from "@/components/sea-saw-page/login/InputGroup";
import { Button } from "@/components/themed/Button";
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
    type: "error" | "success" | "warning" = "error"
  ) => {
    if (Platform.OS === "web" && messageApi) {
      messageApi[type](msg);
    } else {
      Alert.alert(
        type === "error" ? "Error" : type === "warning" ? "Warning" : "Success",
        msg
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
          "success"
        );
        // Redirect to login page after successful registration
        router.replace("/login");
      } else {
        showMessage(
          response.errorMsg || i18n.t("Registration failed, please try again."),
          "error"
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
    <ScrollView style={{ flex: 1 }}>
      <View className="flex min-h-full flex-1 relative" variant="paper">
        {contextHolder}
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
                {i18n.t("Create your account")}
              </Text>
            </View>

            {/* Form */}
            <View className="mt-10">
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
                    <LoginInputGroup
                      label={i18n.t("Username")}
                      placeholder={i18n.t("Enter username")}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      value={values.username}
                      error={touched.username && errors.username}
                    />

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

                    <LoginInputGroup
                      label={i18n.t("First Name (Optional)")}
                      placeholder={i18n.t("Enter first name")}
                      onChangeText={handleChange("first_name")}
                      onBlur={handleBlur("first_name")}
                      value={values.first_name}
                      error={touched.first_name && errors.first_name}
                    />

                    <LoginInputGroup
                      label={i18n.t("Last Name (Optional)")}
                      placeholder={i18n.t("Enter last name")}
                      onChangeText={handleChange("last_name")}
                      onBlur={handleBlur("last_name")}
                      value={values.last_name}
                      error={touched.last_name && errors.last_name}
                    />

                    <LoginInputGroup
                      label={i18n.t("Phone (Optional)")}
                      placeholder={i18n.t("Enter phone number")}
                      keyboardType="phone-pad"
                      onChangeText={handleChange("phone")}
                      onBlur={handleBlur("phone")}
                      value={values.phone}
                      error={touched.phone && errors.phone}
                    />

                    <LoginInputGroup
                      label={i18n.t("Department (Optional)")}
                      placeholder={i18n.t("Enter department")}
                      onChangeText={handleChange("department")}
                      onBlur={handleBlur("department")}
                      value={values.department}
                      error={touched.department && errors.department}
                    />

                    {/* Register button */}
                    <View className="mt-6">
                      <Button
                        variant="primary"
                        onPress={() => handleSubmit()}
                        loading={loading}
                        className="w-full h-10 justify-center rounded-md px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-sm"
                      >
                        {i18n.t("Register")}
                      </Button>
                    </View>

                    {/* Back to login link */}
                    <View className="mt-6 flex flex-row justify-center">
                      <Text variant="primary" className="text-sm">
                        {i18n.t("Already have an account?")}{" "}
                      </Text>
                      <Link href="/login" asChild>
                        <Text className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                          {i18n.t("Sign in")}
                        </Text>
                      </Link>
                    </View>
                  </View>
                )}
              </Formik>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
