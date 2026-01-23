import { useState, useMemo, useCallback } from "react";
import i18n from "@/locale/i18n";
import { Platform, Alert, ScrollView } from "react-native";
import { View } from "@/components/sea-saw-design/view";
import { Text } from "@/components/sea-saw-design/text";
import { Formik } from "formik";
import { InputGroup } from "@/components/sea-saw-page/login/InputGroup";
import { Button } from "@/components/sea-saw-design/button";
import * as Yup from "yup";
import { useAuthStore, selectUser } from "@/stores/authStore";
import { message } from "antd";
import { Avatar } from "@/components/sea-saw-design/avatar";
import { SectionHeader, InfoRow } from "./ProfileComponents";
import { UserCircleIcon } from "react-native-heroicons/outline";

type ProfileFormValues = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
};

export function UserProfileEdit() {
  const user = useAuthStore(selectUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [messageApi, contextHolder] =
    Platform.OS === "web" ? message.useMessage() : [null, null];
  const [loading, setLoading] = useState(false);

  // Memoized avatar text (first 2 letters of username)
  const avatarText = useMemo(() => {
    if (!user?.username) return "?";
    return user.username.slice(0, 2).toUpperCase();
  }, [user?.username]);

  // Helper to show messages on both platforms
  const showMessage = useCallback(
    (msg: string, type: "error" | "success" | "warning" = "error") => {
      if (Platform.OS === "web" && messageApi) {
        messageApi[type](msg);
      } else {
        const title =
          type === "error"
            ? "Error"
            : type === "warning"
              ? "Warning"
              : "Success";
        Alert.alert(title, msg);
      }
    },
    [messageApi],
  );

  // Form submission handler
  const handleSubmit = useCallback(
    async (values: ProfileFormValues) => {
      setLoading(true);
      try {
        const response = await updateProfile(values);
        if (response.status) {
          showMessage(i18n.t("Profile updated successfully"), "success");
        } else {
          showMessage(
            response.errorMsg || i18n.t("Profile update failed"),
            "error",
          );
        }
      } catch (error) {
        showMessage(i18n.t("Profile update failed"), "error");
      } finally {
        setLoading(false);
      }
    },
    [updateProfile, showMessage],
  );

  // Memoized validation schema
  const validationSchema = useMemo(
    () =>
      Yup.object({
        email: Yup.string()
          .email(i18n.t("Invalid email address"))
          .required(i18n.t("Required")),
        first_name: Yup.string(),
        last_name: Yup.string(),
        phone: Yup.string(),
        department: Yup.string(),
      }),
    [],
  );

  // Memoized initial form values
  const initialValues = useMemo<ProfileFormValues>(
    () => ({
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
      department: user?.department || "",
    }),
    [user],
  );

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <Text className="text-lg text-slate-400 font-medium">
          {i18n.t("No user data available")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1, minHeight: "100%" }}
      showsVerticalScrollIndicator={false}
    >
      {contextHolder}

      {/* Gradient Background with Pattern */}
      <View className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <View className="relative px-4 md:px-8 py-8 md:py-12">
          {/* Main Content - Two Column Layout */}
          <View className="flex-col md:flex-row gap-6">
            {/* Left Column - Profile Card */}
            <View className="w-full md:w-5/12 lg:w-4/12">
              <View className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8">
                {/* Avatar Section */}
                <View className="items-center mb-6">
                  {/* Avatar with Ring */}
                  <View className="relative mb-4">
                    <View className="relative bg-white rounded-full p-1.5">
                      <Avatar
                        size={96}
                        shape="circle"
                        gradientColors={["#3b82f6", "#6366f1", "#8b5cf6"]}
                        gradientStart={{ x: 0, y: 0 }}
                        gradientEnd={{ x: 1, y: 1 }}
                      >
                        {avatarText}
                      </Avatar>
                    </View>
                  </View>

                  <Text className="text-2xl font-bold text-slate-800 mb-1">
                    {user.username}
                  </Text>

                  {user.role?.role_name && (
                    <View className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600">
                      <Text className="text-xs font-bold tracking-wider uppercase text-white">
                        {user.role.role_name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Divider */}
                <View className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6" />

                {/* Account Info */}
                <View>
                  <SectionHeader
                    icon={
                      <UserCircleIcon
                        size={18}
                        color="#3b82f6"
                        strokeWidth={2.5}
                      />
                    }
                    title={i18n.t("Account Information")}
                  />

                  <InfoRow label={i18n.t("User ID")} value={`#${user.id}`} />

                  <InfoRow
                    label={i18n.t("Is Staff")}
                    value={
                      <View
                        className={`px-3 py-1 rounded-lg ${
                          user.is_staff ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            user.is_staff ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {user.is_staff ? i18n.t("Yes") : i18n.t("No")}
                        </Text>
                      </View>
                    }
                  />

                  <InfoRow
                    label={i18n.t("Date Joined")}
                    value={
                      user.date_joined
                        ? new Date(user.date_joined).toLocaleDateString()
                        : "-"
                    }
                    isLast={!user.groups || user.groups.length === 0}
                  />

                  {/* Groups */}
                  {user.groups && user.groups.length > 0 && (
                    <View className="py-3">
                      <Text className="text-sm text-slate-500 font-medium mb-3">
                        {i18n.t("Groups")}
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {user.groups.map((g, index) => (
                          <View
                            key={index}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                          >
                            <Text className="text-xs font-semibold text-blue-600">
                              {g.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Right Column - Edit Form */}
            <View className="flex-1">
              <View className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10">
                <Formik
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                  validationSchema={validationSchema}
                  enableReinitialize
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
                      {/* Personal Information */}
                      <View className="mb-8">
                        <View className="flex-row items-center mb-5">
                          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mr-3 shadow-lg shadow-blue-200">
                            <Text className="text-lg">👤</Text>
                          </View>
                          <Text className="text-xl font-bold text-slate-800">
                            {i18n.t("Personal Information")}
                          </Text>
                        </View>

                        <View>
                          <InputGroup
                            label={i18n.t("First Name")}
                            placeholder={i18n.t("Enter first name")}
                            onChangeText={handleChange("first_name")}
                            onBlur={handleBlur("first_name")}
                            value={values.first_name}
                            error={touched.first_name && errors.first_name}
                            containerClassName="mb-0"
                          />

                          <InputGroup
                            label={i18n.t("Last Name")}
                            placeholder={i18n.t("Enter last name")}
                            onChangeText={handleChange("last_name")}
                            onBlur={handleBlur("last_name")}
                            value={values.last_name}
                            error={touched.last_name && errors.last_name}
                            containerClassName="mb-0"
                          />
                        </View>
                      </View>

                      {/* Contact Details */}
                      <View className="mb-8">
                        <View className="flex-row items-center mb-5">
                          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 items-center justify-center mr-3 shadow-lg shadow-purple-200">
                            <Text className="text-lg">📧</Text>
                          </View>
                          <Text className="text-xl font-bold text-slate-800">
                            {i18n.t("Contact Details")}
                          </Text>
                        </View>

                        <View>
                          <InputGroup
                            label={i18n.t("Email")}
                            placeholder={i18n.t("Enter email")}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={handleChange("email")}
                            onBlur={handleBlur("email")}
                            value={values.email}
                            error={touched.email && errors.email}
                            isMandatory={true}
                            containerClassName="mb-0"
                          />

                          <InputGroup
                            label={i18n.t("Phone")}
                            placeholder={i18n.t("Enter phone number")}
                            keyboardType="phone-pad"
                            onChangeText={handleChange("phone")}
                            onBlur={handleBlur("phone")}
                            value={values.phone}
                            error={touched.phone && errors.phone}
                            containerClassName="mb-0"
                          />
                        </View>
                      </View>

                      {/* Work Information */}
                      <View className="mb-8">
                        <View className="flex-row items-center mb-5">
                          <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 items-center justify-center mr-3 shadow-lg shadow-amber-200">
                            <Text className="text-lg">🏢</Text>
                          </View>
                          <Text className="text-xl font-bold text-slate-800">
                            {i18n.t("Work Information")}
                          </Text>
                        </View>

                        <InputGroup
                          label={i18n.t("Department")}
                          placeholder={i18n.t("Enter department")}
                          onChangeText={handleChange("department")}
                          onBlur={handleBlur("department")}
                          value={values.department}
                          error={touched.department && errors.department}
                          containerClassName="mb-0"
                        />
                      </View>

                      {/* Save Button */}
                      <View className="pt-4">
                        <Button
                          type="primary"
                          size="large"
                          onPress={() => handleSubmit()}
                          loading={loading}
                          className="w-full py-4"
                        >
                          <Text className="text-base font-bold text-white tracking-wide">
                            {i18n.t("Save Changes")}
                          </Text>
                        </Button>
                      </View>
                    </View>
                  )}
                </Formik>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
