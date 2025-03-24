import { ScrollView } from "react-native";
import Dropdown, { DropdownProps } from "./Dropdown";
import dayjs, { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

export type DatePickInputProps = DropdownProps & {
  selected?: any;
  setSelected?: React.Dispatch<any>;
  dateFormat?: string
};

// This version only support web
export default function DatePickInput({
  selected,
  setSelected,
  dateFormat="YYYY/MM/DD",
  ...rest
}: DatePickInputProps) {
  const selectedDay: Dayjs = selected ? dayjs(selected) : dayjs();
  return (
    <Dropdown {...rest} value={selected} dropdownClassName="w-fit">
      <ScrollView>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            value={selectedDay}
            onChange={(newValue) => setSelected && setSelected(newValue.format(dateFormat))}
          />
        </LocalizationProvider>
      </ScrollView>
    </Dropdown>
  );
}
