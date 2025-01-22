import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";
import { UserProfile } from "../sea/login/UserProfile";
import { Modal } from "react-native";
import CloseIcon from "./CloseIcon";

type UserModalProps = {
  isVisible: boolean;
  setVisible: any;
};

export default function UserModal({ isVisible, setVisible }: UserModalProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <Animated.View
        entering={FadeIn}
        className="h-full w-full bg-stone-800/50 shadow-md relative"
      >
        <Animated.View
          entering={SlideInRight}
          className="absolute inset-y-0 right-0 w-full md:w-[32rem] "
        >
          <CloseIcon
            onPress={() => setVisible(false)}
            className="absolute top-0 right-0 p-3 z-50"
          />
          <UserProfile />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
