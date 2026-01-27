import React, { useEffect, useState } from "react";
import {
  LocaleConfig,
  Calendar as BaseCalendar,
  CalendarProvider,
} from "react-native-calendars";
import {
  ArrowLeftCircleIcon,
  ArrowRightCircleIcon,
} from "react-native-heroicons/solid";
import { TouchableOpacity, View } from "react-native";
import { useLocaleStore } from "@/stores/localeStore";
import { Text } from "@/components/sea-saw-design/text";
// @ts-ignore
import Lunar from "chinese-lunar";
import clsx from "clsx";

// 配置语言环境，支持中文和英文
LocaleConfig.locales["zh"] = {
  monthNames: [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  dayNames: [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ],
  dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
  today: "今天",
};

LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec.",
  ],
  dayNames: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  dayNamesShort: ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."],
  today: "Today",
};

function Calendar({ markedDates, onDayPress, onMonthChange }: any) {
  const locale = useLocaleStore((state) => state.locale); // 获取当前语言环境
  const [currentLocale, setCurrentLocale] = useState(locale);

  // 处理标记的日期，转换成符合react-native-calendars要求的格式
  const processMarkedDates = (markedDates: Record<string, any[]>) => {
    return (
      markedDates &&
      Object.entries(markedDates).reduce<Record<string, any>>(
        (acc, [key, val]) => {
          // 假设 val 是一个数组，计算它的长度，并将其作为 orderCount 传递给每个日期
          acc[key] = { orderCount: val.length };
          return acc;
        },
        {},
      )
    );
  };

  const processedMarkedDates = processMarkedDates(markedDates);

  // 获取今天的日期并格式化为 'YYYY-MM-DD'
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // 月份从0开始，所以加1
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const processedTodayDate = getTodayDate();

  // 自定义日期组件，用于显示日期、农历和标记数量
  const CustomDayComponent = ({ date, state, marking }: any) => {
    // 获取农历日期
    const lunarDate = Lunar.solarToLunar(new Date(date.dateString), "D");

    // 判断日期是否为周末
    const isWeekend =
      new Date(date.dateString).getDay() === 0 ||
      new Date(date.dateString).getDay() === 6;

    const renderOrderCount = (orderCount: number | undefined) => {
      return orderCount ? (
        <View className="bg-red-400 w-5 h-5 rounded-full absolute -right-2 -top-2 shadow-sm justify-center items-center">
          <Text className="text-xs text-dark-text-primary">
            {orderCount > 99 ? "99+" : orderCount}
          </Text>
        </View>
      ) : null;
    };

    return (
      <TouchableOpacity
        onPress={() => onDayPress && onDayPress(date)} // 点击日期时触发 onDayPress
        className={clsx(
          "flex items-center p-2 hover:bg-zinc-100 relative", // 样式
          state === "disabled" && "opacity-50", // 禁用状态下的样式
        )}
      >
        {/* 显示订单数量 */}
        {renderOrderCount(marking?.orderCount)}
        {/* 显示日期 */}
        <Text className={clsx(isWeekend && "text-red-400")}>{date.day}</Text>
        {/* 显示农历日期 */}
        <Text className="text-zinc-400 text-xs">{lunarDate}</Text>
      </TouchableOpacity>
    );
  };

  // 自定义箭头渲染函数
  const renderArrow = (direction: "left" | "right") => {
    const arrowComponent = {
      left: (
        <ArrowLeftCircleIcon
          size={20}
          color="gray"
          className="text-zinc-500 hover:text-zinc-600"
        />
      ),
      right: (
        <ArrowRightCircleIcon
          size={20}
          color="gray"
          className="text-zinc-500 hover:text-zinc-600"
        />
      ),
    };
    return arrowComponent[direction];
  };

  // 监听语言环境的变化，动态更新日历的语言设置
  useEffect(() => {
    if (LocaleConfig.locales[locale]) {
      LocaleConfig.defaultLocale = locale;
      setCurrentLocale(locale); // 更新 locale 触发重新渲染
    }
  }, [locale]);

  return (
    <View className="flex-row space-x-2 w-full rounded-md">
      <CalendarProvider date={processedTodayDate}>
        {/* 使用动态获取的今天日期 */}
        <BaseCalendar
          renderArrow={renderArrow} // 使用自定义箭头
          style={{ flex: 1 }}
          key={currentLocale} // 通过 key 强制重新加载组件
          dayComponent={({ date, state, marking }: any) => (
            <CustomDayComponent date={date} state={state} marking={marking} />
          )}
          hideExtraDays={true} // 隐藏多余的天数
          markedDates={processedMarkedDates} // 传递处理后的标记日期
          onMonthChange={onMonthChange} // 月份变化时的回调
        />
      </CalendarProvider>
    </View>
  );
}

export { Calendar };
