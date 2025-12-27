import { useToast } from "@/context/Toast";
import { message, Modal } from "antd";
import { useState } from "react";
import { Pressable, Text } from "react-native";

export default function ToastExample() {
  const { showToast } = useToast();
  const [messageApi, contextHolder] = message.useMessage();
  const [open, setOpen] = useState(false);

  const info = () => {
    messageApi.info("Hello, Ant Design!");
  };
  return (
    <>
      <Pressable
        onPress={() => {
          showToast({ message: "This is a toast message" });
        }}
      >
        <Text>Toast Example</Text>
      </Pressable>
      <Pressable onPress={() => setOpen(true)}>Open Modal</Pressable>
      {/* <Modal open={open}> */}
      {contextHolder}
      <Pressable onPress={info}>Display normal message</Pressable>
      {/* </Modal> */}
    </>
  );
}
