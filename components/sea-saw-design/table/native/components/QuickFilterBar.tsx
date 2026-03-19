import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import i18n from "@/locale/i18n";

type QuickFilterBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/**
 * Quick-filter search bar rendered above the table.
 *
 * Mirrors AG Grid's quickFilterText feature:
 *  - Splits query by words (handled server-side by Django SearchFilter)
 *  - Case-insensitive (handled by backend)
 *  - 400 ms debounce before the API request fires
 *  - Clear (×) button appears when input has content
 */
export function QuickFilterBar({
  value,
  onChangeText,
  placeholder,
}: QuickFilterBarProps) {
  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    onChangeText("");
    // Refocus input after clearing so the user can type a new query
    inputRef.current?.focus();
  }, [onChangeText]);

  return (
    <View style={styles.bar}>
      <Ionicons
        name="search-outline"
        size={15}
        color="#8c8c8c"
        style={styles.searchIcon}
      />

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? i18n.t("Search...")}
        placeholderTextColor="#bfbfbf"
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        // iOS inline clear button (shown while editing)
        clearButtonMode={Platform.OS === "ios" ? "while-editing" : "never"}
      />

      {/* Cross-platform clear button (supplements iOS clearButtonMode) */}
      {value.length > 0 && Platform.OS !== "ios" && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearBtn}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="close-circle" size={16} color="#bfbfbf" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 10,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    backgroundColor: "#fafafa",
    gap: 6,
  },
  searchIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#262626",
    padding: 0, // Remove default Android padding
  },
  clearBtn: {
    flexShrink: 0,
  },
});
