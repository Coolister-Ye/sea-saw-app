import React, { useState, useCallback } from "react";
import { Modal, Pressable, View } from "react-native";

import i18n from "@/locale/i18n";
import { Input } from "@/components/sea-saw-design/input";
import { Text } from "@/components/sea-saw-design/text";
import Tag from "@/components/sea-saw-design/tag";
import { Button } from "@/components/sea-saw-design/button";

interface FilterPresetModalProps {
  open: boolean;
  onClose: () => void;
  /** The current active filter params that will be saved */
  currentParams: Record<string, any>;
  onSave: (name: string, params: Record<string, any>) => Promise<void>;
}

export function FilterPresetModal({
  open,
  onClose,
  currentParams,
  onSave,
}: FilterPresetModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const hasParams = Object.keys(currentParams).length > 0;

  const handleSave = useCallback(async () => {
    if (!name.trim() || !hasParams) return;
    setSaving(true);
    try {
      await onSave(name.trim(), currentParams);
      setName("");
    } finally {
      setSaving(false);
    }
  }, [name, hasParams, onSave, currentParams]);

  const handleClose = useCallback(() => {
    setName("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 justify-center items-center p-6"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onPress={handleClose}
      >
        {/* Dialog — stop propagation */}
        <Pressable
          className="bg-background rounded-lg p-6 w-full max-w-[400px]"
          onPress={() => {}}
        >
          <Text className="text-base font-semibold text-foreground mb-5">
            {i18n.t("quickFilter.savePresetTitle")}
          </Text>

          {/* Preset name */}
          <View className="mb-4">
            <View className="flex-row mb-1.5">
              <Text className="text-sm text-foreground">
                {i18n.t("quickFilter.presetName")}
              </Text>
              <Text className="text-sm text-destructive"> *</Text>
            </View>
            <Input
              value={name}
              onChangeText={setName}
              placeholder={i18n.t("quickFilter.presetNamePlaceholder")}
              onSubmitEditing={handleSave}
              maxLength={100}
              autoFocus
            />
          </View>

          {/* Active filters preview */}
          <View className="mb-6">
            <Text className="text-sm text-foreground mb-1.5">
              {i18n.t("quickFilter.activeFilters")}
            </Text>
            {hasParams ? (
              <View className="flex-row flex-wrap gap-1">
                {Object.entries(currentParams).map(([key, value]) => (
                  <Tag key={key} color="blue">
                    {key}: {String(value)}
                  </Tag>
                ))}
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground">
                {i18n.t("quickFilter.noActiveFilter")}
              </Text>
            )}
          </View>

          {/* Footer */}
          <View className="flex-row justify-end gap-2">
            <Button type="default" onPress={handleClose}>
              {i18n.t("Cancel")}
            </Button>
            <Button
              type="primary"
              onPress={handleSave}
              loading={saving}
              disabled={!name.trim() || !hasParams}
            >
              {i18n.t("Save")}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default FilterPresetModal;
