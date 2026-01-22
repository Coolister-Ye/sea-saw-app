import React from "react";
import { View } from "react-native";
import { Tooltip } from "antd";
import {
  UserIcon,
  ClockIcon,
  PencilSquareIcon,
} from "react-native-heroicons/outline";
import CardMetaItem from "./CardMetaItem";

interface CardMetadataProps {
  owner?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  className?: string;
}

/**
 * Card metadata component for displaying common metadata fields
 * Automatically shows owner, created_at, updated_at, created_by, updated_by
 * Only renders fields that have values
 */
export default function CardMetadata({
  owner,
  created_at,
  updated_at,
  created_by,
  updated_by,
  className = "",
}: CardMetadataProps) {
  // Helper to format dates
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Collect all metadata items to render
  const metadataItems: Array<{
    icon: React.ComponentType<{ size: number; color: string }>;
    value: string;
    key: string;
    label: string; // Label for tooltip
  }> = [];

  // Add owner or created_by
  if (owner) {
    metadataItems.push({
      icon: UserIcon,
      value: owner,
      key: "owner",
      label: "Owner",
    });
  } else if (created_by) {
    metadataItems.push({
      icon: UserIcon,
      value: created_by,
      key: "created_by",
      label: "Created By",
    });
  }

  // Add created_at
  if (created_at) {
    metadataItems.push({
      icon: ClockIcon,
      value: formatDate(created_at),
      key: "created_at",
      label: "Created At",
    });
  }

  // Add updated info (either updated_by or updated_at)
  if (updated_by) {
    metadataItems.push({
      icon: PencilSquareIcon,
      value: updated_by,
      key: "updated_by",
      label: "Updated By",
    });
  } else if (updated_at && updated_at !== created_at) {
    // Only show updated_at if it's different from created_at
    metadataItems.push({
      icon: PencilSquareIcon,
      value: formatDate(updated_at),
      key: "updated_at",
      label: "Updated At",
    });
  }

  // Don't render if no metadata
  if (metadataItems.length === 0) {
    return null;
  }

  return (
    <View className={`flex-row items-center gap-4 ${className}`}>
      {metadataItems.map((item) => (
        <Tooltip key={item.key} title={item.label}>
          <View>
            <CardMetaItem icon={item.icon} value={item.value} />
          </View>
        </Tooltip>
      ))}
    </View>
  );
}
