import { Dropdown, Popconfirm, Typography } from "antd";
import React, { useContext, useMemo } from "react";
import { EditableContext } from "./EditableRow";
import { MenuProps } from "antd";
import {
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import View from "@/components/themed/View";
import _ from "lodash";
import { useLocale } from "@/context/Locale";
import { useToast } from "@/context/Toast";
import { Pressable } from "react-native";

// Type for the add options in the dropdown
type AddOption = {
  key: string;
  label: string;
  onAction: () => void; // 选择添加项时执行的操作
};

type ActionCellProps<T> = {
  isRowEditing: boolean;
  addOptions?: AddOption[];
  record: T;
  editingKey: string;
  handleSave: (prevRecord: T, updatedRecord: T) => Promise<void>;
  handleCancel: (record: T) => void;
  handleEdit: (record: T) => void;
  handleDelete?: (record: T) => void;
};

// ActionCell Component
const ActionCell = <T extends Record<string, any>>({
  isRowEditing,
  record,
  addOptions = [],
  editingKey,
  handleSave,
  handleCancel,
  handleEdit,
  handleDelete,
  ...restProps
}: ActionCellProps<T>) => {
  const { form, recordRef } = useContext(EditableContext);
  const { i18n } = useLocale(); // 用于本地化 (i18n)
  const { showToast } = useToast();

  // Save the record with updated fields after validation
  // 在保存时合并更新后的数据并进行字段验证
  const saveRecord = async () => {
    if (!form) return;
    try {
      const values = _.omitBy(await form.validateFields(), _.isUndefined); // 删除未定义的值
      await handleSave(record, { ...recordRef.current, ...values });
    } catch (error) {
      console.error("Save failed:", error); // 保存失败时打印错误
    }
  };

  // Start editing the record and set the form's fields
  // 开始编辑记录并将当前记录的值填入表单
  const startEditing = () => {
    if (form) {
      form.resetFields(); // 重置表单字段
      form.setFieldsValue(record); // 将表单字段设置为当前记录的值
      recordRef.current = record;
      handleEdit(record); // 调用编辑操作
    }
  };

  // Filter valid add options (those with non-empty key and label)
  // 过滤有效的添加选项 (非空的 key 和 label)
  const validAddOptions = useMemo(
    () => addOptions.filter(({ key, label }) => key && label),
    [addOptions]
  );

  // Handle the selection of an add option from the dropdown
  // 处理从下拉框中选择添加选项时的操作
  const handleAddClick: MenuProps["onClick"] = ({ key }) => {
    // 不允许同时行编辑
    if (editingKey !== "") {
      showToast({ message: i18n.t("Exit row editing mode first") });
      return;
    }
    validAddOptions.find((opt) => opt.key === key)?.onAction(); // 执行对应的操作
  };

  // Render an icon inside a View component for consistent styling
  // 在 View 组件中渲染图标，以确保样式一致
  const renderActionIcon = (icon: React.ReactNode) => (
    <View className="items-center justify-center cursor-pointer">{icon}</View>
  );

  return (
    <View {...restProps}>
      {isRowEditing ? (
        // When in editing mode, show Save and Cancel options
        // 在编辑模式下，显示保存和取消操作
        <span>
          <Typography.Link onClick={saveRecord} style={{ marginRight: 8 }}>
            {i18n.t("Save")} {/* 保存按钮 */}
          </Typography.Link>
          <Popconfirm
            title={i18n.t("Are you sure to cancel?")} // 取消操作的确认提示
            onConfirm={() => handleCancel(record)}
          >
            <a>{i18n.t("Cancel")}</a> {/* 取消按钮 */}
          </Popconfirm>
        </span>
      ) : (
        // When not editing, show action buttons (Edit, Add, Delete)
        // 在非编辑模式下，显示操作按钮（编辑、添加、删除）
        <View className="flex-row space-x-2 items-center">
          {/* Edit action */}
          {renderActionIcon(
            <Pressable onPress={startEditing}>
              <PencilSquareIcon className="text-zinc-500 hover:text-zinc-400 h-5" />
            </Pressable>
          )}

          {/* Add options dropdown */}
          {validAddOptions.length > 0 && (
            <Dropdown
              menu={{
                items: validAddOptions.map(({ key, label }) => ({
                  key,
                  label,
                  icon: <PlusCircleIcon size={18} />, // 添加图标
                })),
                onClick: handleAddClick,
              }}
              placement="bottomRight"
            >
              <div className="flex items-center">
                {renderActionIcon(
                  <PlusCircleIcon className="text-lg text-zinc-500 hover:text-zinc-400 h-5" />
                )}
              </div>
            </Dropdown>
          )}

          {/* Delete action */}
          {handleDelete && (
            <Popconfirm
              title={i18n.t("Are you sure to delete?")} // 删除确认提示
              onConfirm={() => handleDelete(record)}
            >
              {renderActionIcon(
                <TrashIcon
                  size={20}
                  className="text-zinc-500 hover:text-zinc-400 h-5"
                />
              )}
            </Popconfirm>
          )}
        </View>
      )}
    </View>
  );
};

export { ActionCell };
