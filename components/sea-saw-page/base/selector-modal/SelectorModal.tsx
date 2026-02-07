import React, { memo } from "react";
import { View, Modal, TouchableWithoutFeedback } from "react-native";

export interface SelectorModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Called when backdrop is pressed or close is requested */
  onClose: () => void;
  /** Header slot (typically <SelectorModalHeader />) */
  header: React.ReactNode;
  /** Footer slot (typically <SelectorModalFooter />) */
  footer: React.ReactNode;
  /** Selector content */
  children: React.ReactNode;
  /** Container width class (default: "w-[95%] md:w-[860px]") */
  width?: string;
}

const SelectorModal = memo(
  ({
    visible,
    onClose,
    header,
    footer,
    children,
    width = "w-[95%] md:w-[860px]",
  }: SelectorModalProps) => (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0 bg-black/60" />
        </TouchableWithoutFeedback>

        <View
          className={`bg-white rounded-2xl ${width} overflow-hidden shadow-2xl border border-gray-100`}
        >
          {header}
          {children}
          {footer}
        </View>
      </View>
    </Modal>
  ),
);

SelectorModal.displayName = "SelectorModal";

export default SelectorModal;
export { SelectorModal };
