import { View, ScrollView, Text } from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { useFormDefs, FormDef } from "@/hooks/useFormDefs";

const DATE_TYPES = ["date", "datetime"];

interface DisplayFormProps {
  table?: string;
  def?: Record<string, any>;
  config?: Record<string, any>;
  data?: Record<string, any>;
  className?: string;
}

function DisplayForm({
  table,
  def,
  config,
  data = {},
  className,
}: DisplayFormProps) {
  const formDefs = useFormDefs({ table, def });

  const formatValue = (value: any, def: FormDef) => {
    if (config?.[def.field]?.render)
      return config[def.field].render(def, value);
    if (value == null || value === "") return "-";
    if (DATE_TYPES.includes(def.type))
      return dayjs(value).isValid()
        ? dayjs(value).format("YYYY-MM-DD HH:mm")
        : value;
    if (def.choices) {
      const choice = def.choices.find((c) => c.value === value);
      return choice ? choice.label : value;
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <View className={clsx("w-full h-full", className)}>
      <ScrollView
        className="w-full h-full"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View className="flex-row flex-wrap justify-between p-2 bg-white rounded mb-2">
            {formDefs
              .filter((def) => !Object.keys(config || {}).includes(def.field))
              .map((def) => (
                <View key={def.field} className={"m-1 w-full sm:w-[48%]"}>
                  <Text className="text-gray-500 text-xs mb-1">
                    {def.label}
                  </Text>
                  <Text
                    className={clsx(
                      "text-gray-900 text-sm font-medium",
                      "break-words"
                    )}
                  >
                    {formatValue(data?.[def.field], def)}
                  </Text>
                </View>
              ))}
          </View>
          {formDefs
            .filter((def) => Object.keys(config || {}).includes(def.field))
            .map((def) => (
              <View
                key={def.field}
                className="bg-white w-full p-2 rounded mb-2"
              >
                {formatValue(data?.[def.field], def)}
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default DisplayForm;
