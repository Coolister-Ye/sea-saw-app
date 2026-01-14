import { View, Text } from "react-native";
import clsx from "clsx";
import dayjs from "dayjs";
import { useFormDefs, FormDef } from "@/hooks/useFormDefs";
import { Button } from "@/components/ui/button";
import { PencilSquareIcon } from "react-native-heroicons/outline";
import FileDisplay from "./FileDisplay";

interface DisplayFormProps {
  table?: string;
  def?: Record<string, any>;
  config?: Record<string, any>;
  data?: Record<string, any>;
  className?: string;
  onEdit?: (data: any) => void;
}

/* ========================
 * DisplayForm
 * ======================== */
function DisplayForm({
  table,
  def,
  config,
  data = {},
  className,
  onEdit,
}: DisplayFormProps) {
  const formDefs = useFormDefs({ table, def });

  /* ========================
   * 字段宽度计算
   * ======================== */
  function getFieldWidthClass(def: FormDef) {
    // 显式全宽（最高优先级）
    if (config?.[def.field]?.fullWidth) {
      return "w-full";
    }

    // 默认：两列布局
    return "w-full sm:w-[48%]";
  }

  /* ========================
   * 渲染字段值
   * ======================== */
  const renderValue = (value: any, def: FormDef) => {
    // 自定义 render（最高优先级）
    if (config?.[def.field]?.render) {
      return config[def.field].render(def, value);
    }

    // 空值兜底
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    // 文件类型
    if (def.type === "file upload") {
      return <FileDisplay value={value} />;
    }

    // 日期时间类型
    if (def.type === "datetime") {
      return dayjs(value).isValid()
        ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
        : String(value);
    }

    // 仅日期类型
    if (def.type === "date") {
      return dayjs(value).isValid()
        ? dayjs(value).format("YYYY-MM-DD")
        : String(value);
    }

    // choices
    if (def.choices?.length) {
      const choice = def.choices.find((c) => c.value === value);
      return choice ? choice.label : String(value);
    }

    // 对象兜底
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <View className={clsx("w-full relative bg-white p-5", className)}>
      {/* 操作编辑模块 */}
      <View className="absolute top-0 right-0">
        {onEdit && (
          <Button size="sm" variant="ghost" onPress={() => onEdit(data)}>
            <PencilSquareIcon size={16} />
          </Button>
        )}
      </View>

      {/* 表单模块 */}
      <View className="flex-row flex-wrap justify-between">
        {formDefs.map((def) => {
          // Skip hidden fields
          if (config?.[def.field]?.hidden) {
            return null;
          }

          return (
            <View
              key={def.field}
              className={clsx("mb-3", getFieldWidthClass(def))}
            >
              <Text className="text-gray-500 text-xs mb-1">{def.label}</Text>

              <Text
                className={clsx(
                  "text-gray-900 text-sm font-medium",
                  "break-words"
                )}
              >
                {renderValue(data?.[def.field], def)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default DisplayForm;
