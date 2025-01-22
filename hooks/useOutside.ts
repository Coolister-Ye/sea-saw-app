import { useCallback, useEffect } from "react";
import { GestureResponderEvent } from "react-native";
import { EventRegister } from "react-native-event-listeners";

// 自定义 Hook：封装了 emit 和监听 outside 的逻辑
export default function useOutside() {
  // 触发 pressOutside 事件的函数
  const outsideEmitter = useCallback((e: GestureResponderEvent) => {
    EventRegister.emit("pressOutside", e);
  }, []);

  // 监听 pressOutside 事件并检测是否点击了 ref 外部
  const onOutside = useCallback(
    (ref: any, callback: (e: any) => void) => {
      useEffect(() => {
        const outsideListener = EventRegister.addEventListener(
          "pressOutside",
          (event: GestureResponderEvent) => {
            const touchEvent = event.nativeEvent;
            if (ref.current) {
              ref.current.measure(
                (_x: number, _y: number, width: number, height: number, pageX: number, pageY: number) => {
                  const isOutside = !(
                    touchEvent.pageX >= pageX &&
                    touchEvent.pageX <= pageX + width &&
                    touchEvent.pageY >= pageY &&
                    touchEvent.pageY <= pageY + height
                  );
                  // 如果点击区域在 ref 外部，触发 callback
                  if (isOutside) {
                    callback(event);
                  }
                }
              );
            }
          }
        );

        // 清除事件监听
        return () => {
          if (typeof outsideListener === 'string') {
            EventRegister.removeEventListener(outsideListener);
          }
        };
      }, [ref, callback]);
    },
    []
  );

  // 返回两个方法：outsideEmitter 和 onOutside
  return { outsideEmitter, onOutside };
}