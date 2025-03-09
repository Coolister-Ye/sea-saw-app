import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  AutoComplete,
  InputNumber,
  Input,
} from "antd";
import { EditableContext } from "./EditableRow";
import _ from "lodash";
import { DebounceSelect } from "./DebounceSelect";
import dayjs from "dayjs";
import { useToast } from "@/context/Toast";
import { useLocale } from "@/context/Locale";

// OptionType 定义了每个选项的类型
type OptionType = {
  value: any;
  label: string;
};

interface EditableCellProps<T> {
  variant?: "picklist" | "text" | "lookup" | "datepicker"; // 定义支持的输入类型
  title: string; // 表头的标题
  editable: boolean; // 是否可以编辑
  required: boolean; // 是否为必填项
  dataIndex: string; // 数据字段索引
  isRowEditing: boolean; // 当前行是否处于编辑状态
  editingKey: any; // 正在编辑的行id
  record: T; // 当前行数据
  options?: OptionType[]; // 选项数据
  dataType?: string; // 数据类型（例如：数字、日期等）
  getOptions?: (search: string) => Promise<OptionType[]>; // 获取选项的函数
  handleSave: (prevRecord: T, record: T) => Promise<void>; // 保存数据的函数
  handleCancel?: (record: T) => void; // 取消编辑的函数
  handleEdit?: (record: T) => void; // 开始编辑的函数
}

// EditableCell 组件用于渲染可编辑单元格
const EditableCell = ({
  variant,
  title,
  editable,
  isRowEditing,
  editingKey,
  required,
  children,
  dataIndex,
  record,
  options,
  dataType,
  getOptions,
  handleSave,
  ...restProps
}: React.PropsWithChildren<EditableCellProps<any>>) => {
  const [editing, setEditing] = useState(false); // 控制编辑状态
  const inputRef = useRef<any>(null); // 引用输入框组件
  const { form, recordRef } = useContext(EditableContext); // 获取编辑上下文
  const toast = useToast();
  const { i18n } = useLocale();
  const popupClassName = "date-picker-popup-for-hack";

  // 编辑开始时，自动聚焦输入框
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  // 切换编辑状态
  const toggleEdit = () => {
    setEditing(!editing);
    form?.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  // 保存编辑后的数据
  const save = async () => {
    try {
      // 获取当前输入值和原始值
      const currentValue = await form?.getFieldValue(dataIndex); // 当前输入值
      const originalValue = record[dataIndex]; // 原始值

      // 如果当前值与原始值相等，直接跳过保存并退出编辑模式
      if (currentValue === originalValue) {
        toggleEdit(); // 结束编辑状态
        return;
      }

      // 校验表单数据
      let values = await form?.validateFields();
      values = _.mapValues(
        values,
        (value) => (value === undefined ? null : value) // 将 undefined 转为 null
      );
      values = _.omitBy(values, _.isUndefined); // 去除 undefined 的值

      // 合并旧数据和新数据
      recordRef.current = { ...recordRef.current, ...values };

      // 执行保存操作
      await handleSave(record, recordRef.current);

      toggleEdit(); // 结束编辑状态
    } catch (err) {
      console.error("Save failed:", err); // 保存失败时打印错误信息
    } finally {
      if (!isRowEditing) {
        toggleEdit(); // 结束编辑状态
      }
    }
  };

  // 处理按键事件，按下 Enter 或 Escape 键时进行相应操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isRowEditing) {
      save();
    }
  };

  const handleInputClick = () => {
    const isEditingCurrentRow =
      editingKey === record.id || editingKey === record.pk;

    if (
      editingKey !== null &&
      editingKey !== undefined &&
      editingKey !== "" &&
      !isEditingCurrentRow
    ) {
      toast.showToast({ message: i18n.t("Exit row editing mode first") });
    } else {
      toggleEdit();
    }
  };

  // 处理失去焦点或选择事件
  const handleBlurOrSelect = async () => {
    if (!isRowEditing) save();
  };

  const handleLookupSelected = async (option: string) => {
    const { value, pk } = option
      ? JSON.parse(option)
      : { value: null, pk: null };
    const pkName = `${dataIndex.split(".").slice(0, -1)}.pk`;

    if (record[pkName] === pk && record[dataIndex] === value) {
      toggleEdit();
      return;
    }

    recordRef.current = {
      ...recordRef.current,
      ...{
        [pkName]: pk,
        [dataIndex]: value,
      },
    };

    if (isRowEditing) {
      form?.setFieldsValue(recordRef.current);
      return;
    }

    try {
      await handleSave(record, recordRef.current);
      toggleEdit();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  // 渲染不同类型的可编辑单元格
  const renderEditableCell = () => {
    if (variant === "picklist") {
      return (
        <Select
          ref={inputRef}
          options={options}
          onBlur={handleBlurOrSelect}
          onKeyDown={handleKeyDown}
          onSelect={handleBlurOrSelect}
          allowClear
        />
      );
    } else if (variant === "lookup") {
      return (
        getOptions && (
          <DebounceSelect
            fetchOptions={getOptions} // 异步获取选项
            ref={inputRef}
            onBlur={handleBlurOrSelect}
            onSelect={handleLookupSelected}
            showSearch
            allowClear
          />
        )
      );
    } else if (variant === "datepicker") {
      return (
        <DatePicker
          popupClassName={popupClassName}
          ref={inputRef}
          onChange={handleBlurOrSelect}
          onKeyDown={handleKeyDown}
          onBlur={(e) => {
            const relatedTarget = e.relatedTarget;

            // Check if relatedTarget is null or undefined before accessing contains
            if (
              relatedTarget &&
              document
                .querySelector(`.${popupClassName}`)
                ?.contains(relatedTarget)
            ) {
              return; // If the relatedTarget is within the popup, do nothing
            }

            handleBlurOrSelect(); // Otherwise, trigger the blur handler
          }}
        />
      );
    } else if (["decimal", "float", "integer"].includes(dataType || "")) {
      return (
        <InputNumber
          ref={inputRef}
          onKeyDown={handleKeyDown}
          onBlur={handleBlurOrSelect}
          style={{ width: "100%" }}
        />
      );
    } else if (options) {
      return (
        <AutoComplete
          ref={inputRef}
          onBlur={handleBlurOrSelect}
          onKeyDown={handleKeyDown}
          options={options}
        />
      );
    } else {
      return (
        <Input
          ref={inputRef}
          onBlur={handleBlurOrSelect}
          onKeyDown={handleKeyDown}
        />
      );
    }
  };

  // 如果不可编辑，直接渲染原始内容
  if (!editable) {
    return <td {...restProps}>{children}</td>;
  }

  return (
    <td {...restProps}>
      {editing || isRowEditing ? (
        <Form.Item
          style={{ margin: 0 }}
          name={dataIndex}
          getValueProps={(value) => ({
            value: variant === "datepicker" && value ? dayjs(value) : value, // 处理日期格式
          })}
          normalize={(value) =>
            variant === "datepicker" && value
              ? `${dayjs(value).format("YYYY-MM-DD")}` // 格式化日期
              : value
          }
          rules={[{ required, message: `${title} is required.` }]} // 校验必填项
        >
          {renderEditableCell()}
        </Form.Item>
      ) : (
        <div
          className="editable-cell-value-wrap"
          style={{ paddingInlineEnd: 24 }}
          onClick={handleInputClick} // 点击开始编辑
        >
          {children}
        </div>
      )}
    </td>
  );
};

export default EditableCell;
