import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import React, { useState, useEffect } from "react";
import { Modal, TouchableWithoutFeedback } from "react-native";
import View from "./View";
import Text from "./Text";
import Button from "./Button";

type AlertProps = {
  isOpen: boolean; // Control modal visibility from parent
  cancelText: string;
  confirmText: string;
  message: {
    title?: string;
    info?: string;
  };
  onCancel?: (e: any) => void; // Optional cancel handler
  onConfirm?: (e: any) => void; // Optional confirm handler
  onClose?: () => void; // Optional onClose callback to handle modal close
};

export default function Alert({
  isOpen,
  cancelText,
  confirmText,
  message,
  onCancel,
  onConfirm,
  onClose,
}: AlertProps) {
  const [open, setOpen] = useState(isOpen);

  // Sync open state with the isOpen prop
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // Handle modal close logic
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose(); // Call onClose if provided
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={open}
      style={{ margin: 0 }}
      transparent
      animationType="fade"
    >
      <View className="flex-1 items-center justify-end p-4 sm:justify-center sm:p-0">
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="absolute inset-0 bg-gray-500 opacity-50" />
        </TouchableWithoutFeedback>
        <View
          variant="paper"
          className="rounded-lg px-4 pb-4 pt-5 shadow-xl sm:my-8 sm:w-full sm:max-w-lg"
        >
          <View className="sm:flex-row sm:items-start">
            <View className="mx-auto h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon
                aria-hidden="true"
                className="h-6 w-6 text-red-600"
              />
            </View>
            <View className="flex-1 mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <Text
                variant="primary"
                className="text-base font-semibold leading-6"
              >
                {message.title}
              </Text>
              <Text variant="secondary" className="mt-2 text-sm">
                {message.info}
              </Text>
            </View>
          </View>

          <View className="mt-5 sm:mt-4 sm:flex-1 sm:flex-row-reverse">
            <Button
              variant="error"
              className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
              onPress={onConfirm}
              accessibilityLabel="Confirm action"
            >
              {confirmText}
            </Button>
            <Button
              variant="outlined"
              className="mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
              onPress={(e) => {
                onCancel && onCancel(e);
                handleClose();
              }}
              accessibilityLabel="Cancel action"
            >
              {cancelText}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
