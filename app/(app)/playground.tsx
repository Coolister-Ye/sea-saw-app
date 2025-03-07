import { Calendar } from "@/components/data/Calendar";
import { Avatar } from "@/components/navigation/Avatar";
import { WebSplashScreen } from "@/components/navigation/WebSplashScreen";
import { UserProfile } from "@/components/sea/login/UserProfile";
import { ColumnsToolBar } from "@/components/table/ColumnToolBar";
import { SearchToolBar } from "@/components/table/SearchToolBar";
import View from "@/components/themed/View";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";

export default function Playground() {
  //   const options = [
  //     { id: "1", label: "A-01", checked: false },
  //     { id: "2", label: "A-02", checked: false },
  //     { id: "3", label: "A-03", checked: true },
  //     { id: "4", label: "A-05", checked: true },
  //     { id: "5", label: "A-05", checked: true },
  //   ];

  // const options = [...Array(100)].map((_, i) => {
  //   return {
  //     id: i.toString(),
  //     label: `Items-${i}`,
  //     checked: Math.random() < 0.5, // 0.5 的概率生成 true 或 false
  //   };
  // });

  const columns = [
    {
      title: "交易名称",
      dataIndex: "deal_name",
      type: "string",
      required: true,
      read_only: false,
      operations: ["exact", "startswith"],
      id: 0,
      label: "交易名称",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "Full Name",
      dataIndex: "contact.full_name",
      type: "string",
      required: false,
      read_only: false,
      operations: ["startswith"],
      id: 1,
      label: "Full Name",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "金额",
      dataIndex: "amount",
      type: "decimal",
      required: false,
      read_only: false,
      operations: ["gte", "lte"],
      id: 2,
      label: "金额",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "预计收入",
      dataIndex: "expected_revenue",
      type: "decimal",
      required: false,
      read_only: false,
      id: 3,
      label: "预计收入",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "成交日期",
      dataIndex: "closing_date",
      type: "datetime",
      required: true,
      read_only: false,
      operations: ["exact", "gte", "lte"],
      id: 4,
      label: "成交日期",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "描述",
      dataIndex: "description",
      type: "string",
      required: false,
      read_only: false,
      id: 5,
      label: "描述",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "ID",
      dataIndex: "contract.pk",
      type: "integer",
      required: false,
      read_only: true,
      id: 6,
      label: "ID",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "所有者",
      dataIndex: "contract.owner",
      type: "string",
      required: false,
      read_only: true,
      id: 7,
      label: "所有者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建者",
      dataIndex: "contract.created_by",
      type: "string",
      required: false,
      read_only: true,
      id: 8,
      label: "创建者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新者",
      dataIndex: "contract.updated_by",
      type: "string",
      required: false,
      read_only: true,
      id: 9,
      label: "更新者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建时间",
      dataIndex: "contract.created_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 10,
      label: "创建时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新时间",
      dataIndex: "contract.updated_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 11,
      label: "更新时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "合同代码",
      dataIndex: "contract.contract_code",
      type: "string",
      required: true,
      read_only: false,
      operations: ["startswith"],
      id: 12,
      label: "合同代码",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "合同日期",
      dataIndex: "contract.contract_date",
      type: "date",
      required: true,
      read_only: false,
      id: 13,
      label: "合同日期",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "ID",
      dataIndex: "contract.orders.pk",
      type: "integer",
      required: false,
      read_only: true,
      id: 14,
      label: "ID",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "所有者",
      dataIndex: "contract.orders.owner",
      type: "string",
      required: false,
      read_only: true,
      id: 15,
      label: "所有者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建者",
      dataIndex: "contract.orders.created_by",
      type: "string",
      required: false,
      read_only: true,
      id: 16,
      label: "创建者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新者",
      dataIndex: "contract.orders.updated_by",
      type: "string",
      required: false,
      read_only: true,
      id: 17,
      label: "更新者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建时间",
      dataIndex: "contract.orders.created_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 18,
      label: "创建时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新时间",
      dataIndex: "contract.orders.updated_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 19,
      label: "更新时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "订单代码",
      dataIndex: "contract.orders.order_code",
      type: "string",
      required: false,
      read_only: false,
      id: 20,
      label: "订单代码",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "预计交货日期",
      dataIndex: "contract.orders.etd",
      type: "date",
      required: false,
      read_only: false,
      id: 21,
      label: "预计交货日期",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "押金",
      dataIndex: "contract.orders.deposit",
      type: "decimal",
      required: false,
      read_only: false,
      id: 22,
      label: "押金",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "余额",
      dataIndex: "contract.orders.balance",
      type: "decimal",
      required: false,
      read_only: false,
      id: 23,
      label: "余额",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "目的港",
      dataIndex: "contract.orders.destination_port",
      type: "string",
      required: false,
      read_only: false,
      id: 24,
      label: "目的港",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "ID",
      dataIndex: "contract.orders.products.pk",
      type: "integer",
      required: false,
      read_only: true,
      id: 25,
      label: "ID",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "所有者",
      dataIndex: "contract.orders.products.owner",
      type: "string",
      required: false,
      read_only: true,
      id: 26,
      label: "所有者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建者",
      dataIndex: "contract.orders.products.created_by",
      type: "string",
      required: false,
      read_only: true,
      id: 27,
      label: "创建者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新者",
      dataIndex: "contract.orders.products.updated_by",
      type: "string",
      required: false,
      read_only: true,
      id: 28,
      label: "更新者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建时间",
      dataIndex: "contract.orders.products.created_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 29,
      label: "创建时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新时间",
      dataIndex: "contract.orders.products.updated_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 30,
      label: "更新时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "产品名称",
      dataIndex: "contract.orders.products.product_name",
      type: "string",
      required: true,
      read_only: false,
      choices: [
        {
          label: "原条罗非鱼",
          value: "原条罗非鱼",
        },
        {
          label: "一去罗非鱼",
          value: "一去罗非鱼",
        },
        {
          label: "二去罗非鱼",
          value: "二去罗非鱼",
        },
        {
          label: "三去罗非鱼",
          value: "三去罗非鱼",
        },
        {
          label: "原条红罗非鱼",
          value: "原条红罗非鱼",
        },
        {
          label: "一去红罗非鱼",
          value: "一去红罗非鱼",
        },
        {
          label: "二去红罗非鱼",
          value: "二去红罗非鱼",
        },
        {
          label: "三去红罗非鱼",
          value: "三去红罗非鱼",
        },
        {
          label: "罗非鱼片",
          value: "罗非鱼片",
        },
      ],
      field_type: "picklist",
      id: 31,
      label: "产品名称",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "产品代码",
      dataIndex: "contract.orders.products.product_code",
      type: "string",
      required: false,
      read_only: false,
      id: 32,
      label: "产品代码",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "产品类型",
      dataIndex: "contract.orders.products.product_type",
      type: "string",
      required: false,
      read_only: false,
      id: 33,
      label: "产品类型",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "包装类型",
      dataIndex: "contract.orders.products.packaging",
      type: "string",
      required: false,
      read_only: false,
      id: 34,
      label: "包装类型",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "内包装类型",
      dataIndex: "contract.orders.products.interior_packaging",
      type: "string",
      required: false,
      read_only: false,
      id: 35,
      label: "内包装类型",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "尺寸",
      dataIndex: "contract.orders.products.size",
      type: "string",
      required: false,
      read_only: false,
      id: 36,
      label: "尺寸",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "单位",
      dataIndex: "contract.orders.products.unit",
      type: "string",
      required: false,
      read_only: false,
      id: 37,
      label: "单位",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "包冰比例",
      dataIndex: "contract.orders.products.glazing",
      type: "decimal",
      required: false,
      read_only: false,
      id: 38,
      label: "包冰比例",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "数量",
      dataIndex: "contract.orders.products.quantity",
      type: "integer",
      required: false,
      read_only: false,
      id: 39,
      label: "数量",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "价格",
      dataIndex: "contract.orders.products.price",
      type: "decimal",
      required: false,
      read_only: false,
      id: 40,
      label: "价格",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "总价",
      dataIndex: "contract.orders.products.total_price",
      type: "decimal",
      required: false,
      read_only: false,
      id: 41,
      label: "总价",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "物料阶段",
      dataIndex: "contract.orders.products.progress_material",
      type: "string",
      required: false,
      read_only: false,
      id: 42,
      label: "物料阶段",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "生产进度数量",
      dataIndex: "contract.orders.products.progress_quantity",
      type: "integer",
      required: false,
      read_only: false,
      id: 43,
      label: "生产进度数量",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
      fixed: "right",
    },
    {
      title: "ID",
      dataIndex: "pk",
      type: "integer",
      required: false,
      read_only: true,
      id: 44,
      label: "ID",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "所有者",
      dataIndex: "owner",
      type: "string",
      required: false,
      read_only: true,
      id: 45,
      label: "所有者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建者",
      dataIndex: "created_by",
      type: "string",
      required: false,
      read_only: true,
      id: 46,
      label: "创建者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新者",
      dataIndex: "updated_by",
      type: "string",
      required: false,
      read_only: true,
      id: 47,
      label: "更新者",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 48,
      label: "创建时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      type: "datetime",
      required: false,
      read_only: true,
      id: 49,
      label: "更新时间",
      checked: true,
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "operation",
      dataIndex: "operation",
      fixed: "right",
      width: 150,
    },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState();

  return (
    // <View className="bg-white h-full">
    //   {/* <ColumnsToolBar columns={options} /> */}
    //   {/* <Avatar source={require("@/assets/images/app.png")} text="Coolister" />
    //   <Avatar text="Coolister" />
    //   <Avatar /> */}
    //   <UserProfile />
    // </View>
    <View className="h-full w-full justify-center items-center">
      {/* <WebSplashScreen /> */}
      {/* <SearchToolBar columns={columns} /> */}
      <Calendar onDayPress={(day: any) => console.log(day)} />
      {/* <Picker
        selectedValue={selectedLanguage}
        onValueChange={(itemValue, itemIndex) => setSelectedLanguage(itemValue)}
        // style={{ backgroundColor: "green" }}
        mode={"dropdown"}
      >
        <Picker.Item
          label="Java"
          value="java"
          style={{ backgroundColor: "green" }}
        />
        <Picker.Item label="JavaScript" value="js" />
      </Picker> */}
    </View>
  );
}
