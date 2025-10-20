import { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  DimensionValue,
} from "react-native";
import Modal from "react-native-modal";
import { X } from "lucide-react-native"; // 关闭图标，可换成你自己的

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode; // 底部操作按钮
  width?: DimensionValue;
};

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 600,
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
      <View style={{ flex: 1 }} className="relative">
        <View
          style={{ width }}
          className="absolute inset-y-0 right-0 w-full sm:w-[600px] bg-white shadow-xl"
        >
          {/* Header */}
          <View className="flex flex-row justify-between items-center p-5 border-b border-gray-200 bg-white">
            <Text className="text-lg font-semibold">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 bg-gray-50 p-5"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footer && (
            <View className="bg-white flex flex-row gap-3 p-5 border-t border-gray-200">
              {footer}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
