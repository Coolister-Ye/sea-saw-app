import { useMemo } from "react";

type ChoiceItem = { value: string; label: string };

/**
 * Builds a label lookup map from def.choices for status tag components.
 * Shared across all status tag components to eliminate duplication.
 */
export function useStatusLabelMap(
  def?: { choices?: ChoiceItem[] },
): Record<string, string> {
  return useMemo(() => {
    if (!def?.choices) return {};
    return Object.fromEntries(
      def.choices.map(({ value, label }) => [value, label]),
    );
  }, [def?.choices]);
}
