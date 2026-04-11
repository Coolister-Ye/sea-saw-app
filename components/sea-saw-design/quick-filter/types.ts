import React from "react";

export interface QuickFilterOption {
  key: string;
  label: React.ReactNode;
  /** Static params object or factory function (for date-relative filters) */
  params: Record<string, any> | (() => Record<string, any>);
  deletable?: boolean;
  onDelete?: () => void;
}

export interface QuickFilterSection {
  title: string;
  options: QuickFilterOption[];
  /** Show a dividing line above this section */
  divider?: boolean;
}

export interface QuickFilterProps {
  sections: QuickFilterSection[];
  activeKey: string;
  onChange: (key: string, params: Record<string, any>) => void;
  /** Called when user clicks "+ Save filter" */
  onAddPreset?: () => void;
  className?: string;
}
