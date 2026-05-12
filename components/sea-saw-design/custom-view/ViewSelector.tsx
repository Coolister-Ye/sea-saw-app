import React, { useCallback, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import {
  ChevronDownIcon,
  PencilSquareIcon,
  PlusIcon,
  StarIcon,
  XMarkIcon,
} from "react-native-heroicons/mini";
import { StarIcon as StarOutlineIcon } from "react-native-heroicons/outline";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/sea-saw-design/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/sea-saw-design/popover";
import { Text } from "@/components/sea-saw-design/text";
import { cn } from "@/components/sea-saw-design/utils";
import i18n from "@/locale/i18n";
import type { CustomView } from "@/hooks/useCustomViews";

type TriggerHandle = { open: () => void; close: () => void };

export interface ViewSelectorProps {
  /** All views (system + user + shared) — pass the full `views` array from useCustomViews */
  views: CustomView[];
  activeViewId: number | null;
  onSelectView: (view: CustomView) => void;
  onDeleteView: (id: number) => void;
  onEditView: (view: CustomView) => void;
  onSetDefaultView: (id: number) => void;
  onNewView: () => void;
  className?: string;
}

export function ViewSelector({
  views,
  activeViewId,
  onSelectView,
  onDeleteView,
  onEditView,
  onSetDefaultView,
  onNewView,
  className,
}: ViewSelectorProps) {
  const triggerRef = useRef<TriggerHandle>(null);
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<CustomView | null>(null);

  const closePopover = useCallback(() => triggerRef.current?.close(), []);

  const activeView = views.find((v) => v.id === activeViewId);
  const activeLabel = activeView?.name ?? i18n.t("customView.views");

  const systemViews = views.filter((v) => v.is_system);
  const myViews = views.filter((v) => !v.is_system && v.is_owner);
  const sharedViews = views.filter((v) => !v.is_system && !v.is_owner);

  const handleSelect = useCallback(
    (view: CustomView) => {
      onSelectView(view);
      closePopover();
    },
    [onSelectView, closePopover],
  );

  const handleDeletePress = useCallback(
    (view: CustomView) => {
      closePopover();
      setTimeout(() => setPendingDelete(view), 150);
    },
    [closePopover],
  );

  const handleEditPress = useCallback(
    (view: CustomView) => {
      closePopover();
      setTimeout(() => onEditView(view), 150);
    },
    [onEditView, closePopover],
  );

  const handleNewView = useCallback(() => {
    closePopover();
    setTimeout(onNewView, 150);
  }, [onNewView, closePopover]);

  return (
    <View className={className}>
      <Popover onOpenChange={setOpen}>
        <PopoverTrigger
          ref={triggerRef as any}
          className="flex-row items-center gap-1 rounded-full border border-border h-7 px-3 max-w-[200px] active:opacity-70 web:hover:border-primary/60 web:transition-colors web:duration-150"
        >
          <Text
            className="text-xs font-medium text-foreground/80 flex-1 web:whitespace-nowrap"
            numberOfLines={1}
          >
            {activeLabel}
          </Text>
          <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
            <ChevronDownIcon size={11} color="#999" />
          </View>
        </PopoverTrigger>

        <PopoverContent align="start" sideOffset={6} className="w-[280px] p-1">
          {/* System views */}
          {systemViews.length > 0 && (
            <View>
              <Text className="text-[11px] font-medium text-muted-foreground px-3 pt-2 pb-1">
                {i18n.t("customView.systemPresets")}
              </Text>
              {systemViews.map((view) => {
                const isActive = activeViewId === view.id;
                return (
                  <Pressable
                    key={view.id}
                    role="button"
                    onPress={() => handleSelect(view)}
                    className={cn(
                      "px-3 py-1.5 rounded active:opacity-60 web:hover:bg-accent web:transition-colors",
                      isActive && "web:bg-accent/60",
                    )}
                  >
                    <Text
                      className={cn(
                        "text-sm web:whitespace-nowrap",
                        isActive ? "text-primary font-medium" : "text-foreground",
                      )}
                      numberOfLines={1}
                    >
                      {view.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* My custom views */}
          {myViews.length > 0 && (
            <View className="border-t border-border/60 mt-1">
              <Text className="text-[11px] font-medium text-muted-foreground px-3 pt-2 pb-1">
                {i18n.t("customView.myViews")}
              </Text>
              {myViews.map((view) => {
                const isActive = activeViewId === view.id;
                return (
                  <View
                    key={view.id}
                    className={cn(
                      "flex-row items-center rounded pr-1 web:hover:bg-accent web:transition-colors",
                      isActive && "web:bg-accent/60",
                    )}
                  >
                    <Pressable
                      role="button"
                      onPress={() => handleSelect(view)}
                      className="flex-1 px-3 py-1.5 active:opacity-60 flex-row items-center gap-1.5"
                    >
                      <Text
                        className={cn(
                          "text-sm web:whitespace-nowrap flex-1",
                          isActive ? "text-primary font-medium" : "text-foreground",
                        )}
                        numberOfLines={1}
                      >
                        {view.name}
                      </Text>
                      {view.is_default && <StarIcon size={11} color="#f59e0b" />}
                    </Pressable>

                    {!view.is_default && (
                      <Pressable
                        role="button"
                        onPress={() => onSetDefaultView(view.id)}
                        className="p-1.5 rounded active:opacity-50 web:hover:bg-accent"
                      >
                        <StarOutlineIcon size={13} color="#c0c0c0" />
                      </Pressable>
                    )}
                    <Pressable
                      role="button"
                      onPress={() => handleEditPress(view)}
                      className="p-1.5 rounded active:opacity-50 web:hover:bg-accent"
                    >
                      <PencilSquareIcon size={13} color="#c0c0c0" />
                    </Pressable>
                    <Pressable
                      role="button"
                      onPress={() => handleDeletePress(view)}
                      className="p-1.5 rounded active:opacity-50 web:hover:bg-accent"
                    >
                      <XMarkIcon size={13} color="#c0c0c0" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}

          {/* Shared views */}
          {sharedViews.length > 0 && (
            <View className="border-t border-border/60 mt-1">
              <Text className="text-[11px] font-medium text-muted-foreground px-3 pt-2 pb-1">
                {i18n.t("customView.sharedViews")}
              </Text>
              {sharedViews.map((view) => {
                const isActive = activeViewId === view.id;
                return (
                  <Pressable
                    key={view.id}
                    role="button"
                    onPress={() => handleSelect(view)}
                    className={cn(
                      "px-3 py-1.5 rounded active:opacity-60 web:hover:bg-accent web:transition-colors",
                      isActive && "web:bg-accent/60",
                    )}
                  >
                    <View className="flex-row items-center gap-1">
                      <Text
                        className={cn(
                          "text-sm web:whitespace-nowrap flex-1",
                          isActive ? "text-primary font-medium" : "text-foreground",
                        )}
                        numberOfLines={1}
                      >
                        {view.name}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {view.owner_username}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* New view button */}
          <View className="border-t border-border/60 mt-1">
            <Pressable
              role="button"
              onPress={handleNewView}
              className="flex-row items-center gap-1.5 px-3 py-2 active:opacity-60 web:hover:bg-accent web:transition-colors"
            >
              <PlusIcon size={12} color="#bbb" />
              <Text className="text-xs text-muted-foreground web:whitespace-nowrap">
                {i18n.t("customView.newView")}
              </Text>
            </Pressable>
          </View>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(v) => !v && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {i18n.t("customView.deleteView")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{i18n.t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onPress={() => {
                if (pendingDelete) onDeleteView(pendingDelete.id);
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

export default ViewSelector;
