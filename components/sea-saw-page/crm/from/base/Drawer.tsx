import { ReactNode } from "react";
import { View, DimensionValue, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { X } from "lucide-react-native";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void; // 必填，外部负责控制
  children: ReactNode;
  width?: DimensionValue;
}

export default function Drawer({
  isOpen,
  onClose,
  children,
  width = 900,
}: DrawerProps) {
  return (
    <Modal
      isVisible={isOpen}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      style={{ margin: 0 }}
      backdropOpacity={0.1}
      onBackdropPress={onClose}
    >
      <View className="flex-1 relative">
        {/* 关闭按钮 */}
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-5 right-5 z-50"
        >
          <X size={20} color="black" />
        </TouchableOpacity>

        {/* Drawer 内容区 */}
        <View
          style={{ width }}
          className="absolute inset-y-0 right-0 bg-white shadow-xl"
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

export { Drawer };
