import {
  AutoComplete,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Form,
  InputNumber,
  Select,
} from "antd";
import { useLocale } from "@/context/Locale";
import { BasicFrame } from "../sea-saw-page/BasicFrame";
import dayjs from "dayjs";
import { createStyles } from "antd-style";
import { ScrollView, TextInput } from "react-native";
import { DebounceSelect } from "./DebounceSelect";
import { useState } from "react";
import { NumberRangeInput } from "./NumberRangeInput";

// OptionType 定义了每个选项的类型
type OptionType = {
  value: any;
  label: string;
};

// Column 类型，表示搜索表单的每一列
type Column = {
  title: string; // 列的标题
  dataIndex: string; // 对应数据的字段名
  operations?: string[]; // 可选的操作类型，例如"exact"、"gte"、"lte"
  options?: OptionType[]; // 选项数据
  getOptions?: (search: string) => Promise<OptionType[]>; // 获取选项的函数
  variant?: "picklist" | "text" | "lookup" | "datepicker"; // 定义支持的输入类型
  type: string; //数据类型
};

// SearchToolBarProps 类型，表示搜索工具栏组件的属性
type SearchToolBarProps = {
  columns: Column[]; // 传入的列数据
  onSubmit: (filterParams: Record<string, string>) => void; // 提交时调用的函数
  onCancel: () => void; // 取消时调用的函数
};

// SearchToolBar 组件：用于显示搜索工具栏，包含表单和搜索逻辑
export function SearchToolBar({
  columns,
  onSubmit,
  onCancel,
}: SearchToolBarProps) {
  const { i18n } = useLocale(); // 获取国际化对象
  const [form] = Form.useForm(); // 创建表单实例
  const { styles } = useStyle(); // 获取样式

  // 提交表单
  const handlePressSubmit = () => form.submit();
  // 取消操作
  const handlePressCancel = () => onCancel && onCancel();
  // 重置表单
  const handleReset = () => form.resetFields();

  // 根据列的配置渲染输入框和选择框
  const renderInputWithSelect = ({
    operations,
    dataIndex,
    variant,
    getOptions,
    type,
    options,
  }: Column) => {
    // 如果没有操作选项，则不渲染
    if (!operations) return null;

    // 格式化操作选项
    let operationOpts = operations.map((opr) => ({
      value: opr,
      label: i18n.t(opr), // 使用国际化的标签
      key: opr,
    }));

    const rangeOpt = { value: "range", label: i18n.t("between"), key: "range" };

    if (
      variant === "datepicker" ||
      ["decimal", "float", "integer"].includes(type || "")
    ) {
      operationOpts = [...operationOpts, rangeOpt];
    }

    const [currentOpr, setCurrentOpr] = useState<string>(
      operationOpts[0]?.value
    );

    // 替换数据字段中的"."为"__"以避免命名冲突
    const formatedDi = dataIndex.replace(/\./g, "__");

    // 渲染不同类型的可编辑单元格
    const inputComponent = () => {
      if (currentOpr === "isnull") {
        return (
          <Select
            options={[
              { value: true, label: i18n.t("true") },
              { value: false, label: i18n.t("false") },
            ]}
            allowClear
            style={{ minWidth: 80, flex: 1 }}
          />
        );
      } else if (variant === "picklist") {
        return (
          <Select
            options={options}
            allowClear
            style={{ minWidth: 80, flex: 1 }}
          />
        );
      } else if (variant === "lookup") {
        return (
          getOptions && (
            <DebounceSelect
              fetchOptions={getOptions} // 异步获取选项
              showSearch
              allowClear
              style={{ minWidth: 80, flex: 1 }}
            />
          )
        );
      } else if (variant === "datepicker") {
        if (currentOpr === "range") {
          const { RangePicker } = DatePicker;
          return <RangePicker style={{ minWidth: 80 }} />;
        }
        return <DatePicker style={{ minWidth: 80, flex: 1 }} />;
      } else if (["decimal", "float", "integer"].includes(type || "")) {
        if (currentOpr === "range") {
          return <NumberRangeInput className={`${styles.customRangeInput}`} />;
        }
        return <InputNumber style={{ minWidth: 80, flex: 1 }} />;
      } else {
        return (
          <AutoComplete
            options={options}
            style={{
              minWidth: 80,
              flex: 1,
            }}
          />
        );
      }
    };

    return (
      <div className={`flex flex-row`}>
        <ConfigProvider
          theme={{
            components: {
              Select: {
                selectorBg: "#f0f0f0",
              },
            },
          }}
        >
          <div className={`${styles.customSelect} text-center`}>
            <Form.Item
              name={`${formatedDi}-operation`}
              initialValue={operationOpts[0]?.value} // 默认选中第一个操作
              noStyle
            >
              <Select
                labelInValue={false}
                options={operationOpts}
                style={{ width: 100 }}
                onChange={(val) => setCurrentOpr(val)}
              />
            </Form.Item>
          </div>
        </ConfigProvider>
        <ConfigProvider
          theme={{
            components: {
              Select: {
                selectorBg: "#ffffff",
              },
            },
          }}
        >
          <div className={`${styles.customInput} w-full`}>
            <Form.Item
              name={formatedDi}
              getValueProps={(value) => {
                if (variant === "datepicker") {
                  if (Array.isArray(value)) {
                    return value
                      .filter((v) => dayjs(v).isValid()) // 过滤无效的日期
                      .map((v) => `${dayjs(v).format("YYYY-MM-DD")}`);
                  } else {
                    return `${dayjs(value).format("YYYY-MM-DD")}`;
                  }
                }
                return {};
              }}
              normalize={(value) => {
                if (variant === "datepicker") {
                  if (Array.isArray(value)) {
                    return value
                      .filter((v) => dayjs(v).isValid()) // 过滤无效的日期
                      .map((v) => `${dayjs(v).format("YYYY-MM-DD")}`);
                  } else {
                    return `${dayjs(value).format("YYYY-MM-DD")}`;
                  }
                }
                return value;
              }}
              noStyle
            >
              {inputComponent()}
            </Form.Item>
          </div>
        </ConfigProvider>
      </div>
    );
  };

  // 构建搜索参数
  const buildFilterParams = (values: Record<string, any>) => {
    const filterParams: Record<string, string> = {};

    // 遍历所有字段
    Object.keys(values).forEach((key) => {
      const value = values[key];

      // 跳过操作字段和空值字段
      if (key.includes("-operation") || !value) return;

      // 获取操作符，默认为 'exact'
      const operationKey = `${key}-operation`;
      const operation = values[operationKey] || "exact";

      // 将range筛选转化成对比操作
      if (operation === "range" && Array.isArray(value)) {
        filterParams[`${key}__gte`] = value[0];
        filterParams[`${key}__lte`] = value[1];
      } else if (operation === "range" && typeof value === "object") {
        filterParams[`${key}__gte`] = value.min;
        filterParams[`${key}__lte`] = value.max;
      } else if (operation === "exact") {
        // 对于 exact 操作符，直接传入值
        filterParams[key] = value;
      } else {
        // 对于其他操作符（如 'contains', 'lt', 'gt' 等），构造字段
        filterParams[`${key}__${operation}`] = value;
      }
    });

    return filterParams;
  };

  // 表单提交时的处理
  const onFinish = (values: Record<string, any>) => {
    const filterParams = buildFilterParams(values); // 构建筛选参数
    onSubmit && onSubmit(filterParams); // 调用提交函数
  };

  return (
    <BasicFrame
      handleSubmit={handlePressSubmit}
      handleCancel={handlePressCancel}
      handleReset={handleReset}
      headerText={i18n.t("search bar")} // 使用国际化的搜索框标题
    >
      <ScrollView>
        <Form
          form={form}
          name="searchToolBar"
          labelWrap
          labelCol={{ span: 6 }} // 标签宽度
          wrapperCol={{ span: 18 }} // 输入框宽度
          onFinish={onFinish}
          colon={false} // 不使用冒号
          initialValues={{}} // 初始值为空
          className="px-3"
        >
          {/* 遍历列，渲染搜索框 */}
          {columns
            .filter((col) => col.operations) // 只渲染有操作选项的列
            .map((col) => (
              <Form.Item label={col.title} key={col.dataIndex}>
                {renderInputWithSelect(col)} {/* 渲染输入框和选择框 */}
              </Form.Item>
            ))}
        </Form>
      </ScrollView>
    </BasicFrame>
  );
}

// 定义样式，主要用于自定义 Select 和 Input 的边框样式
const useStyle = createStyles(({ css }) => ({
  customSelect: css`
    .ant-select-selector {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none !important;
    }

    /* Hover 效果 */
    .ant-select-selector:hover {
      border-right: 1px solid #1890ff !important;
    }

    /* Active 效果 */
    .ant-select-focused {
      border-right: 1px solid #1890ff !important;
    }
  `,
  customInput: css`
    .ant-picker {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      width: 100%;
    }

    .ant-input {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      width: 100%;
    }

    .ant-select-selector {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      width: 100%;
    }

    .ant-input-number {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      width: 100%;
    }
  `,
  customRangeInput: css`
    .ant-input-number:first-of-type {
      border-radius: 0;
      width: 100%;
    }
    .ant-input-number:nth-of-type(2) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      width: 100%;
    }
  `,
}));
