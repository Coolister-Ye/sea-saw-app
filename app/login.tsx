import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import View from "@/components/themed/View";
import Image from "@/components/themed/Image";
import Text from "@/components/themed/Text";
import { Formik } from "formik";
import Checkbox from "expo-checkbox";
import LoginInputGroup from "@/components/sea/login/InputGroup";
import Button from "@/components/themed/Button";
import * as Yup from "yup";
import { useAuth } from "@/context/Auth";
import { useLocale } from "@/context/Locale";
import Toast from "@/components/themed/Toast";

// 登录页面组件
// Login screen component
export default function LoginScreen() {
  const { login } = useAuth(); // 使用Auth上下文中的login方法进行登录 / Using the login method from Auth context
  const { i18n } = useLocale(); // 获取国际化方法 / Get the i18n method for localization
  const [isRemember, setRemember] = useState(false); // 记住密码的状态管理 / State management for "Remember me" checkbox
  const [warning, setWarning] = useState<string | null>(null);

  return (
    <View className="flex min-h-full flex-1 relative" variant="paper">
      <Toast
        variant="warning"
        message={warning}
        onClose={() => setWarning(null)}
      />
      {/* 页面内容区域 / Main content area */}
      <View className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <View className="mx-auto w-full max-w-sm lg:w-96">
          <View>
            {/* 显示应用Logo / Display app logo */}
            <Image
              source={require("@/assets/images/app.png")}
              className="h-10 w-10"
            />
            {/* 标题：登录 / Title: Sign in */}
            <Text
              className="mt-8 text-2xl font-bold leading-9 tracking-tight"
              variant="primary"
            >
              {i18n.t("Sign in to your account")}
            </Text>
          </View>

          {/* Formik 表单，处理表单的提交和验证 / Formik form for managing submission and validation */}
          <View className="mt-10">
            <Formik
              initialValues={{ username: "", password: "" }} // 表单的初始值 / Initial form values
              onSubmit={(values) => login(values)} // 提交表单时调用login方法 / Call login method on form submit
              validationSchema={Yup.object({
                // 使用Yup进行表单验证 / Using Yup for form validation
                username: Yup.string().required(i18n.t("Required")), // 用户名字段验证 / Username field validation
                password: Yup.string().required(i18n.t("Required")), // 密码字段验证 / Password field validation
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
                  {/* 用户名输入框 / Username input field */}
                  <LoginInputGroup
                    label={i18n.t("Username")}
                    placeholder={i18n.t("Enter username")}
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    value={values.username}
                    error={touched.username && errors.username} // 显示用户名验证错误 / Display username validation error
                  />
                  {/* 密码输入框 / Password input field */}
                  <LoginInputGroup
                    label={i18n.t("Password")}
                    secureTextEntry={true} // 密码框设置为隐秘文本 / Set password field as secure text
                    placeholder={i18n.t("Enter password")}
                    autoComplete="current-password" // 提示当前密码 / Autofill for current password
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    error={touched.password && errors.password} // 显示密码验证错误 / Display password validation error
                  />

                  {/* 记住我和忘记密码的部分 / "Remember me" and "Forgot password" sections */}
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex flex-row items-center">
                      {/* 记住我复选框 / "Remember me" checkbox */}
                      <Checkbox
                        value={isRemember}
                        onValueChange={() => setRemember(!isRemember)} // 切换记住我状态 / Toggle the "Remember me" state
                        style={styles.checkbox}
                        color={isRemember ? "rgb(79 70 229)" : undefined}
                        className="hover:border-indigo-600"
                      />
                      <Text
                        variant="primary"
                        className="ml-3 block text-sm leading-6"
                      >
                        {i18n.t("Remember me")}
                      </Text>
                    </View>
                    {/* 忘记密码链接 / "Forgot password" link */}
                    <Pressable
                      className="font-semibold text-indigo-600 hover:text-indigo-500 text-sm leading-6"
                      onPress={() =>
                        setWarning(i18n.t("Contact admin to change password"))
                      }
                    >
                      <Text>{i18n.t("Forgot password?")}</Text>
                    </Pressable>
                  </View>

                  {/* 提交按钮 / Submit button */}
                  <View className="mt-6">
                    <Button
                      variant="primary"
                      onPress={() => handleSubmit()} // 提交表单 / Submit the form
                      className="flex w-full justify-center rounded-md px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-sm"
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

// 样式定义 / Styles definition
const styles = StyleSheet.create({
  checkbox: {
    height: 16,
    width: 16,
    borderRadius: 4,
    borderColor: "#D1D5DB", // 设置边框颜色 / Set border color
    borderWidth: 1,
    color: "#4F46E5", // 设置勾选颜色 / Set checkmark color
  },
});
