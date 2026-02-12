import React from "react";
import { View } from "react-native";
import CardMetadata from "./CardMetadata";
import CardEditButton from "../CardEditButton";
import CardSection from "./CardSection";

interface CardFooterProps {
  /**
   * Entity data containing metadata fields
   */
  metadata?: {
    owner?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    created_by?: string | null;
    updated_by?: string | null;
  };

  /**
   * Whether to show edit button
   */
  canEdit?: boolean;

  /**
   * Edit button click handler
   */
  onEdit?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Card footer component
 * Displays metadata and optional edit button
 *
 * @example
 * <Card.Footer
 *   metadata={item}
 *   canEdit={true}
 *   onEdit={handleEdit}
 * />
 */
export default function CardFooter({
  metadata,
  canEdit = false,
  onEdit,
  className = "",
}: CardFooterProps) {
  return (
    <CardSection className={`py-2.5 bg-slate-50/50 ${className}`}>
      <View className="flex-row justify-between items-center">
        <CardMetadata
          owner={metadata?.owner}
          created_at={metadata?.created_at}
          updated_at={metadata?.updated_at}
          created_by={metadata?.created_by}
          updated_by={metadata?.updated_by}
        />
        {canEdit && onEdit && <CardEditButton onClick={onEdit} />}
      </View>
    </CardSection>
  );
}
