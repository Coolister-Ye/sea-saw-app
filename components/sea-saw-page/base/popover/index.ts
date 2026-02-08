/**
 * Popover components barrel export
 *
 * Centralized exports for all popover-related components and types
 */

// Export main component
export { default as PopoverCard } from "./PopoverCard";
export { PopoverCard as PopoverCardComponent } from "./PopoverCard";

// Export sub-components
export { PopoverHeader } from "./PopoverHeader";
export { PopoverInfoRow } from "./PopoverInfoRow";

// Export all types
export type {
  FieldMetaDef,
  ColumnDef,
  PopoverCardProps,
  PopoverHeaderProps,
  PopoverInfoRowProps,
} from "./PopoverCard.types";
