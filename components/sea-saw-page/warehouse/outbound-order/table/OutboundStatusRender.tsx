import React from "react";
import { Text, View } from "react-native";
import type { CustomCellRendererProps } from "ag-grid-react";
import OutboundStatusTag from "@/components/sea-saw-page/warehouse/outbound-order/display/OutboundStatusTag";

function OutboundStatusRender(props: CustomCellRendererProps) {
  const statusValue = props.value as string | null;
  const statusDef = props.context?.meta?.status;

  if (!statusValue) {
    return <Text className="text-muted-foreground">—</Text>;
  }

  return (
    <View className="h-full justify-center">
      <OutboundStatusTag value={statusValue} def={statusDef} />
    </View>
  );
}

export default OutboundStatusRender;
export { OutboundStatusRender };
