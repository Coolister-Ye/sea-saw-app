import { UserProfile } from "@/components/sea/login/UserProfile";
import Animated, { FadeIn, SlideInRight } from "react-native-reanimated";

// 用户屏幕组件，展示用户个人资料
// User screen component to display user profile
export default function UserScreen() {
  return (
    // 外层容器，使用FadeIn动画从透明过渡到不透明，设置背景颜色和阴影
    // Outer container with FadeIn animation for transition from transparent to opaque, background color, and shadow
    <Animated.View
      entering={FadeIn} // 使用 FadeIn 动画进入 / Using FadeIn animation on entry
      className="h-full w-full bg-stone-800/50 shadow-md"
    >
      {/* 绝对定位的内部容器，使用SlideInRight动画从右侧滑入，设置宽度 */}
      {/* Inner container with absolute positioning, SlideInRight animation from the right, and width settings */}
      <Animated.View
        entering={SlideInRight} // 使用 SlideInRight 动画进入 / Using SlideInRight animation on entry
        className="absolute inset-y-0 right-0 w-full md:w-[32rem]"
      >
        {/* 用户个人资料组件 / User profile component */}
        <UserProfile />
      </Animated.View>
    </Animated.View>
  );
}
