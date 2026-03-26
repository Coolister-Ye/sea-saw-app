import dayjs from "dayjs";
import type { HeaderMetaProps, FieldType } from "@/components/sea-saw-design/form/interface";
import type { ComputedColumn } from "../../types";

function formatValue(value: any, fieldMeta?: HeaderMetaProps): string {
  if (value === null || value === undefined) return "";
  if (!fieldMeta) return String(value);

  const type = fieldMeta.type as FieldType;

  switch (type) {
    case "date": {
      const d = dayjs(value);
      return d.isValid() ? d.format("YYYY-MM-DD") : String(value);
    }
    case "datetime": {
      const d = dayjs(value);
      return d.isValid() ? d.format("YYYY-MM-DD HH:mm") : String(value);
    }
    case "choice": {
      const match = fieldMeta.choices?.find((c) => c.value === String(value));
      return match ? match.label : String(value);
    }
    case "nested object":
    case "field": {
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) return `(${value.length})`;
        const keys = fieldMeta.display_fields ?? ["id"];
        return keys
          .map((k) => value[k])
          .filter((v) => v != null)
          .join(", ");
      }
      return String(value);
    }
    case "boolean":
      return value ? "✓" : "✗";
    default:
      return String(value);
  }
}

export function resolveValue(
  col: ComputedColumn,
  row: Record<string, any>,
  context?: Record<string, any>,
): any {
  if (col.valueGetter) {
    return col.valueGetter({ data: row, context });
  }
  return row[col.field];
}

export function formatCellValue(
  col: ComputedColumn,
  value: any,
  row: Record<string, any>,
  context?: Record<string, any>,
): string {
  if (col.valueFormatter) {
    return col.valueFormatter({ value, data: row, context });
  }
  return formatValue(value, col.fieldMeta);
}
