import { Button } from "@/components/sea-saw-design/button";
import { ActionCell } from "@/components/sea-saw-design/table/ActionCell";
import { DeleteActionCell } from "@/components/sea-saw-design/table/DeleteActionCell";
import { Text } from "@/components/sea-saw-design/text";
import { TextInput } from "react-native";

export default function ButtonExample() {
  return (
    <>
      {/* ✅ 加载状态： */}
      <Button variant="default" loading>
        加载中...
      </Button>

      {/* ✅ 其他内置 variant 示例： */}
      <Button variant="primary.dark">暗色主按钮</Button>
      <Button variant="primary.light">暗色主按钮</Button>
      <Button variant="outline">边框按钮</Button>
      <Button variant="ghost">幽灵按钮</Button>
      <Button variant="link">链接按钮</Button>

      {/* ✅ 设置尺寸： */}
      <Button size="sm">小按钮</Button>
      <Button size="lg">大按钮</Button>

      <DeleteActionCell />
      <TextInput
        style={{ padding: 10, borderWidth: 1, borderColor: "gray" }}
        placeholder="请输入内容"
      />
    </>
  );
}
