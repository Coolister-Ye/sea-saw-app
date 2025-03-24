import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ColDef, ModuleRegistry } from "ag-grid-community";
import React, { StrictMode, useState } from "react";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import SelectList from "@/components/sea-saw-page/SelectList";
import { Picker } from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select";
import { View, StyleSheet, Text } from "react-native";
import Tag from "@/components/sea-saw-design/tag";
import Tab from "@/components/sea-saw-design/tabs";
import DownloadScreen from "@/components/sea-saw-page/download";

ModuleRegistry.registerModules([AllEnterpriseModule]);

// Row Data Interface
interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

export default function Playground() {
  // Row Data: The data to be displayed.
  const [activeTab, setActiveTab] = useState<number>(0);
  const [rowData, setRowData] = useState<IRow[]>([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Mercedes", model: "EQA", price: 48890, electric: true },
    { make: "Fiat", model: "500", price: 15774, electric: false },
    { make: "Nissan", model: "Juke", price: 20675, electric: false },
  ]);

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" },
  ]);

  const defaultColDef = {
    flex: 1,
  };

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
  const handleTabClick = (key: string, index: number) => {
    console.log(`Tab ${key} clicked at index ${index}`);
    setActiveTab(index); // Update the active tab index
  };
  const [selectedLanguage, setSelectedLanguage] = useState();

  // Container: Defines the grid's theme & dimensions.
  return (
    <View style={{ width: "100%", height: "100%" }}>
      {/* <Tag color="red" closable checked>
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
      ></SelectList>
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={(itemValue, itemIndex) => setSelectedLanguage(itemValue)}
        className="bg-green-100"
      >
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
      </Picker> */}
      {/* <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
      /> */}
      <View className="h-96 w-full">
        <DownloadScreen></DownloadScreen>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  pickerWrapper: {
    width: 200,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    color: "black",
  },
  modalStyle: {
    top: 50, // 控制 Picker 下拉框的位置
  },
});
