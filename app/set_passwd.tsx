import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import View from "@/components/themed/View";
import Text from "@/components/themed/Text";
import { Formik } from "formik";
import InputGroup from "@/components/sea/login/InputGroup";
import Button from "@/components/themed/Button";
import * as Yup from "yup";
import { useAuth } from "@/context/Auth";
import { useLocale } from "@/context/Locale";
import Toast from "@/components/themed/Toast";

// 登录页面组件 / Login screen component
export default function SetPasswdScreen() {
  const { setPasswd } = useAuth(); // 使用Auth上下文中的setPasswd方法进行密码修改 / Using the setPasswd method from Auth context
  const { i18n } = useLocale(); // 获取国际化方法 / Get the i18n method for localization
  const [warning, setWarning] = useState<string | null>(null);

  return (
    <View className="flex min-h-full flex-1 relative" variant="paper">
      <Toast
        variant="warning"
        message={warning}
        onClose={() => setWarning(null)}
      />
      {/* 页面内容区域 / Main content area */}
      <View className="p-5">
        <View className="w-full md:w-96">
          <View>
            {/* 标题：修改密码 / Title: Change Password */}
            <Text
              className="mt-8 text-2xl font-bold leading-9 tracking-tight"
              variant="primary"
            >
              {i18n.t("Change Password")}
            </Text>
          </View>

          {/* Formik 表单，处理表单的提交和验证 / Formik form for managing submission and validation */}
          <View className="mt-10">
            <Formik
              initialValues={{
                new_password: "",
                current_password: "",
                confirm_password: "",
              }} // 表单的初始值 / Initial form values
              onSubmit={(values) => setPasswd(values)} // 提交表单时调用setPasswd方法 / Call setPasswd method on form submit
              validationSchema={Yup.object({
                new_password: Yup.string()
                  .required(i18n.t("Required"))
                  .min(8, i18n.t("Password must be at least 8 characters")),
                current_password: Yup.string().required(i18n.t("Required")),
                confirm_password: Yup.string()
                  .required(i18n.t("Required"))
                  .oneOf(
                    [Yup.ref("new_password")],
                    i18n.t("Passwords must match")
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
                  {/* 旧密码输入框 / Current password input field */}
                  <InputGroup
                    label={i18n.t("Current Password")}
                    secureTextEntry={true}
                    placeholder={i18n.t("Enter current password")}
                    autoComplete="current-password"
                    onChangeText={handleChange("current_password")}
                    onBlur={handleBlur("current_password")}
                    value={values.current_password}
                    error={touched.current_password && errors.current_password}
                  />

                  {/* 新密码输入框 / New password input field */}
                  <InputGroup
                    label={i18n.t("New Password")}
                    secureTextEntry={true}
                    placeholder={i18n.t("Enter new password")}
                    autoComplete="new-password"
                    onChangeText={handleChange("new_password")}
                    onBlur={handleBlur("new_password")}
                    value={values.new_password}
                    error={touched.new_password && errors.new_password}
                  />

                  {/* 确认密码输入框 / Confirm password input field */}
                  <InputGroup
                    label={i18n.t("Confirm Password")}
                    secureTextEntry={true}
                    placeholder={i18n.t("Confirm new password")}
                    autoComplete="new-password"
                    onChangeText={handleChange("confirm_password")}
                    onBlur={handleBlur("confirm_password")}
                    value={values.confirm_password}
                    error={touched.confirm_password && errors.confirm_password}
                  />

                  {/* 提交按钮 / Submit button */}
                  <View className="mt-6 w-fit">
                    <Button
                      variant="primary"
                      onPress={() => handleSubmit()} // 提交表单 / Submit the form
                      className="rounded-md px-3 py-1.5 text-base font-semibold leading-6 text-white shadow-sm"
                    >
                      {i18n.t("Confirm")}
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
    borderColor: "#D1D5DB",
    borderWidth: 1,
    color: "#4F46E5",
  },
});
