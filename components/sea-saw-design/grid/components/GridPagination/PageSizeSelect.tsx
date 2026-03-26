import React, { useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles, textStyles, C } from "./styles";
import { PAGE_SIZE_OPTIONS } from "./constants";

type PageSizeSelectProps = {
  value: number;
  onChange(v: number): void;
  disabled?: boolean;
};

export function PageSizeSelect({ value, onChange, disabled }: PageSizeSelectProps) {
  const [open, setOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const triggerRef = useRef<View>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, width: 0 });
  const ITEM_H = 28;

  const openDropdown = useCallback(() => {
    if (disabled) return;
    triggerRef.current?.measure((_fx, _fy, w, _h, px, py) => {
      setPos({ x: px, y: py, width: w });
      setOpen(true);
    });
  }, [disabled]);

  return (
    <>
      <TouchableOpacity
        ref={triggerRef as any}
        onPress={openDropdown}
        activeOpacity={0.7}
        disabled={disabled}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
      >
        <Text style={textStyles.triggerText}>{value}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={11}
          color={disabled ? C.disabled : C.secondary}
          style={{ marginLeft: 3 }}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={{ flex: 1 }}>
            <View
              style={[
                styles.dropdownList,
                { left: pos.x, top: pos.y - PAGE_SIZE_OPTIONS.length * ITEM_H - 4, minWidth: pos.width },
              ]}
            >
              {PAGE_SIZE_OPTIONS.map((opt, idx) => {
                const isSelected = opt === value;
                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => { setOpen(false); if (opt !== value) onChange(opt); }}
                    onPressIn={() => setHoveredIdx(idx)}
                    onPressOut={() => setHoveredIdx(null)}
                    activeOpacity={0.8}
                    style={[styles.listItem, { height: ITEM_H }, (hoveredIdx === idx || isSelected) && styles.listItemActive]}
                  >
                    <Text style={[textStyles.listItemText, isSelected && textStyles.listItemTextSelected]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
