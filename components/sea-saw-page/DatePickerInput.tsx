import { ScrollView } from "react-native";
import Dropdown, { DropdownProps } from "./Dropdown";
import dayjs from "dayjs";
import { Calendar, DateData } from "react-native-calendars";

export type DatePickInputProps = DropdownProps & {
  selected?: string;
  setSelected?: (date: string) => void;
  dateFormat?: string;
};

export default function DatePickInput({
  selected,
  setSelected,
  dateFormat = "YYYY/MM/DD",
  ...rest
}: DatePickInputProps) {
  // Convert selected date to YYYY-MM-DD format for react-native-calendars
  const selectedDateString = selected ? dayjs(selected).format("YYYY-MM-DD") : "";

  const handleDayPress = (day: DateData) => {
    if (setSelected) {
      // Format the date according to the specified format
      setSelected(dayjs(day.dateString).format(dateFormat));
    }
  };

  return (
    <Dropdown {...rest} value={selected} dropdownClassName="w-80">
      <ScrollView>
        <Calendar
          current={selectedDateString || undefined}
          onDayPress={handleDayPress}
          markedDates={
            selectedDateString
              ? {
                  [selectedDateString]: {
                    selected: true,
                    selectedColor: "#3b82f6",
                  },
                }
              : undefined
          }
          theme={{
            todayTextColor: "#3b82f6",
            selectedDayBackgroundColor: "#3b82f6",
            selectedDayTextColor: "#ffffff",
            arrowColor: "#3b82f6",
          }}
        />
      </ScrollView>
    </Dropdown>
  );
}
