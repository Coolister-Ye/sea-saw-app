import React, { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import {
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from "react-native-heroicons/mini";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/sea-saw-design/popover";
import { Text } from "@/components/sea-saw-design/text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/sea-saw-design/alert-dialog";
import { cn } from "@/components/sea-saw-design/utils";
import i18n from "@/locale/i18n";

import { QuickFilterOption, QuickFilterSection, QuickFilterProps } from "./types";
import { resolveParams } from "./utils";

export type { QuickFilterOption, QuickFilterSection };

type TriggerHandle = { open: () => void; close: () => void };

// ── Section component ─────────────────────────────────────────────────────────

interface PresetSectionProps {
  section: QuickFilterSection;
  activeKey: string;
  onSelect: (option: QuickFilterOption) => void;
  onDeletePress: (option: QuickFilterOption) => void;
}

function PresetSection({ section, activeKey, onSelect, onDeletePress }: PresetSectionProps) {
  return (
    <View className={cn(section.divider && "border-t border-border/60 mt-1")}>
      <Text className="text-[11px] font-medium text-muted-foreground px-3 pt-2 pb-1">
        {section.title}
      </Text>
      {section.options.map((option) => (
        <View
          key={option.key}
          className={cn(
            "flex-row items-center rounded web:hover:bg-accent web:transition-colors",
            option.deletable ? "pr-1" : "",
            activeKey === option.key && "web:bg-accent/60",
          )}
        >
          <Pressable
            role="button"
            onPress={() => onSelect(option)}
            className="flex-1 px-3 py-1.5 active:opacity-60"
          >
            <Text
              className={cn(
                "text-sm web:whitespace-nowrap",
                activeKey === option.key
                  ? "text-primary font-medium"
                  : "text-foreground",
              )}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>

          {option.deletable && (
            <Pressable
              role="button"
              onPress={() => onDeletePress(option)}
              className="p-1.5 rounded active:opacity-50 web:hover:bg-accent"
            >
              <XMarkIcon size={13} color="#c0c0c0" />
            </Pressable>
          )}
        </View>
      ))}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuickFilter({
  sections,
  activeKey,
  onChange,
  onAddPreset,
  className,
}: QuickFilterProps) {
  const triggerRef = useRef<TriggerHandle>(null);
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<QuickFilterOption | null>(null);

  const activeOption = useMemo(
    () => sections.flatMap((s) => s.options).find((o) => o.key === activeKey),
    [sections, activeKey],
  );

  const closePopover = useCallback(() => triggerRef.current?.close(), []);

  const handleSelect = useCallback(
    (option: QuickFilterOption) => {
      onChange(option.key, resolveParams(option.params));
      closePopover();
    },
    [onChange, closePopover],
  );

  const handleDeletePress = useCallback(
    (option: QuickFilterOption) => {
      closePopover();
      // Small delay so the popover can animate out before the dialog opens
      setTimeout(() => setPendingDelete(option), 150);
    },
    [closePopover],
  );

  return (
    <View className={className}>
      <Popover onOpenChange={setOpen}>
        {/* ── Trigger ── */}
        <PopoverTrigger
          ref={triggerRef as any}
          className="flex-row items-center gap-1 rounded-full border border-border h-7 px-3 max-w-[180px] active:opacity-70 web:hover:border-primary/60 web:transition-colors web:duration-150"
        >
          <Text
            className="text-xs font-medium text-foreground/80 flex-1 web:whitespace-nowrap"
            numberOfLines={1}
          >
            {activeOption ? activeOption.label : activeKey}
          </Text>
          <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
            <ChevronDownIcon size={11} color="#999" />
          </View>
        </PopoverTrigger>

        {/* ── Popover menu ── */}
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto w-[280px] p-1"
        >
          {sections.map((section, index) => (
            <PresetSection
              key={index}
              section={section}
              activeKey={activeKey}
              onSelect={handleSelect}
              onDeletePress={handleDeletePress}
            />
          ))}

          {/* Save filter */}
          {onAddPreset && (
            <View className="border-t border-border/60 mt-1">
              <Pressable
                role="button"
                onPress={() => {
                  closePopover();
                  onAddPreset();
                }}
                className="flex-row items-center gap-1.5 px-3 py-2 active:opacity-60 web:hover:bg-accent web:transition-colors"
              >
                <PlusIcon size={12} color="#bbb" />
                <Text className="text-xs text-muted-foreground web:whitespace-nowrap">
                  {i18n.t("quickFilter.saveFilter")}
                </Text>
              </Pressable>
            </View>
          )}
        </PopoverContent>
      </Popover>

      {/* Delete confirmation — outside Popover to avoid nested modal issues */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {i18n.t("quickFilter.deletePreset")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                pendingDelete?.onDelete?.();
                setPendingDelete(null);
              }}
              className="bg-error"
            >
              {i18n.t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

export default QuickFilter;
