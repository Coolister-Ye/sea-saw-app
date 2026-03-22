import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { View, StyleSheet, Text } from "react-native";
import SelectList from "@/components/sea-saw-page/SelectList";
import Tag from "@/components/sea-saw-design/tag";
import Tab from "@/components/sea-saw-design/tabs";
import DownloadScreen from "@/components/sea-saw-page/download";

const Tab1Content = () => (
  <View>
    <Text>Tab 1 Content</Text>
  </View>
);
const Tab2Content = () => (
  <View>
    <Text>Tab 2 Content</Text>
  </View>
);
const Tab3Content = () => (
  <View>
    <Text>Tab 3 Content</Text>
  </View>
);

const routes = [
  { key: "tab1", title: "Tab 1", component: Tab1Content },
  { key: "tab2", title: "Tab 2", component: Tab2Content },
  { key: "tab3", title: "Tab 3", component: Tab3Content },
];

export default function Playground() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>();

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Tag color="red" closable checked>
        Tag 1
      </Tag>
      <Tag color="orange" checkable>
        进行中
      </Tag>
      <Tag color="yellow" bordered={false}>
        已完成
      </Tag>
      <Tag color="green">延误中</Tag>
      <Tag color="cyan">问题单</Tag>
      <Tag color="blue">Tag 1</Tag>
      <Tag color="purple">Tag 1</Tag>
      <Tag color="pink">Tag 1</Tag>
      <Tag closable checkable checked>
        Tag 1
      </Tag>
      <Tab items={routes} defaultActiveKey="tab1" />
      <SelectList
        selected={{ value: "Tesla", id: "Tesla" }}
        options={[
          { value: "Tesla", id: "Tesla" },
          { value: "Toyota", id: "Toyota" },
        ]}
      />
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
        className="bg-green-100"
      >
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
      </Picker>
      <View className="h-96 w-full">
        <DownloadScreen />
      </View>
    </div>
  );
}
