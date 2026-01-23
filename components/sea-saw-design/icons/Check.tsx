import { Ionicons } from "@expo/vector-icons";
import { iconWithClassName } from "./iconWithClassName";

const Check = (props: any) => <Ionicons name="checkmark" {...props} />;
iconWithClassName(Check);
export { Check };
