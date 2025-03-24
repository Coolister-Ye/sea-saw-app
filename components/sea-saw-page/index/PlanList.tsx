import { useLocale } from "@/context/Locale";
import View from "../../themed/View";
import Text from "@/components/themed/Text";
import clsx from "clsx";

// 定义每个计划项的类型
type PlanProps = {
  order_code: string; // 订单编码
  stage: string | null | undefined; // 阶段
  owner: string | null | undefined; // 所有者
};

// 定义 PlanList 组件的 props 类型
type PlanListProps = {
  plans: PlanProps[]; // 计划项列表
  posList: string[]; // 当前阶段列表
};

export function PlanList({ plans, posList = [] }: PlanListProps) {
  const { i18n } = useLocale(); // 获取国际化的内容

  // 将 posList 转换为 Set 来提高包含检查的性能
  const posSet = new Set(posList);

  return (
    <View className="p-3 w-full rounded-md">
      <View className="mt-5 flex flex-row flex-wrap justify-between">
        {plans.map((item) => (
          <View
            key={item.order_code} // 使用唯一的 order_code 作为 key
            className="w-full sm:w-[49%] rounded-md mb-3 flex-row overflow-hidden bg-zinc-100"
            variant="paper"
          >
            {/* 根据阶段判断背景色，使用 clsx 来构建动态类 */}
            <View
              className={clsx(
                "flex w-10 shrink-0 items-center justify-center rounded-l-md",
                // 先确保 item.stage 是有效的 string 再进行包含检查
                posSet.has(item.stage || "") ? "bg-green-400" : "bg-red-400"
              )}
            ></View>

            <View className="p-2">
              {/* 显示订单号 */}
              <Text
                variant="primary"
                className="font-semibold hover:text-gray-600"
              >
                {`${i18n.t("order")}: `}
                {item.order_code}
              </Text>

              {/* 显示阶段，若状态未知则显示 "???" */}
              <Text className="text-xs" variant="secondary">
                {`${i18n.t("stage")}: `}
                {item.stage || "???"}
              </Text>

              {/* 显示所有者，若状态未知则显示 "???" */}
              <Text className="text-xs" variant="secondary">
                {`${i18n.t("owner")}: `}
                {item.owner || "???"}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
