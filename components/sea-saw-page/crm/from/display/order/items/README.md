# OrderCard Field Section Configuration

## Overview

The OrderCard component now supports **section-based field grouping** to improve visual organization and readability. Instead of displaying all fields in a single flat grid, you can organize fields into logical sections with custom titles and styling.

## Configuration

### Basic Usage (Flat Layout - Default)

If you don't specify `sections` in `FIELD_CONFIG`, fields will be displayed in a single flat grid (legacy behavior):

```typescript
const FIELD_CONFIG = {
  exclude: ["id", "pipeline", "order_code", ...],
  fullWidth: ["comment", "notes", ...],
  // No sections = flat layout
};
```

### Section-based Layout (New)

Organize fields into multiple sections with titles:

```typescript
const FIELD_CONFIG = {
  exclude: ["id", "pipeline", "order_code", ...],
  fullWidth: ["comment", "notes", ...],
  sections: [
    {
      title: "basic_information", // i18n key (will be translated)
      fields: ["order_date", "expected_delivery_date", "delivery_address"],
    },
    {
      title: "financial_information", // i18n key
      fields: ["total_amount", "paid_amount", "payment_status"],
    },
    {
      title: "other_details", // i18n key
      fields: ["priority", "source", "sales_person"],
      className: "bg-blue-50/30", // Optional: custom styling
    },
  ],
};
```

**Important**: Section titles are i18n keys that will be translated using `i18n.t()`. Make sure to add corresponding translations in your locale files (`locale/en.json`, `locale/zh.json`, etc.).

## Section Configuration Options

Each section supports the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `title` | `string` | No | Section heading displayed above fields (i18n key, will be translated via `i18n.t()`) |
| `fields` | `string[]` | Yes | Array of field names to include in this section |
| `className` | `string` | No | Custom Tailwind classes for section styling (default: `bg-slate-50/70`) |

## Features

### 1. **Automatic Empty Field Filtering**
- Sections with no visible fields (when `hideEmptyFields={true}`) are automatically hidden
- Empty sections don't render at all, keeping the UI clean

### 2. **Flexible Field Organization**
- Group related fields together logically (e.g., dates, financial info, contact details)
- Each section can have its own visual styling

### 3. **Custom Styling**
- Use `className` to apply custom backgrounds, borders, or spacing
- Example: `className: "bg-blue-50/30"` for a subtle blue tint

### 4. **Backward Compatible**
- If `sections` is not defined, falls back to flat layout
- Existing implementations continue to work without changes

## Examples

### Example 1: Simple 2-Section Layout

```typescript
sections: [
  {
    title: "order_details", // i18n key
    fields: ["order_date", "delivery_date", "status"],
  },
  {
    title: "pricing_info", // i18n key
    fields: ["subtotal", "tax", "total_amount"],
  },
]
```

### Example 2: Section without Title

```typescript
sections: [
  {
    fields: ["order_date", "delivery_date"], // No title
  },
  {
    title: "payment_info", // i18n key
    fields: ["paid_amount", "payment_method"],
  },
]
```

### Example 3: Custom Styling Per Section

```typescript
sections: [
  {
    title: "critical_info", // i18n key
    fields: ["priority", "due_date"],
    className: "bg-red-50/40 border-l-2 border-red-300",
  },
  {
    title: "standard_info", // i18n key
    fields: ["created_at", "updated_at"],
    className: "bg-slate-50/70", // Default style
  },
]
```

## Migration Guide

To convert existing flat layouts to section-based layouts:

### Before (Flat Layout)
```typescript
const FIELD_CONFIG = {
  exclude: [...],
  fullWidth: [...],
};
```

### After (Section-based Layout)
```typescript
const FIELD_CONFIG = {
  exclude: [...],
  fullWidth: [...],
  sections: [
    {
      title: "section_one", // i18n key - add to locale files
      fields: ["field1", "field2", "field3"],
    },
    {
      title: "section_two", // i18n key - add to locale files
      fields: ["field4", "field5"],
    },
  ],
};
```

**Don't forget**: Add the corresponding i18n keys to your locale files:

```json
// locale/en.json
{
  "section_one": "Section 1",
  "section_two": "Section 2"
}

// locale/zh.json
{
  "section_one": "第一部分",
  "section_two": "第二部分"
}
```

## Technical Details

### Hook Enhancement

The `useCardItemHelpers` hook now returns `fieldSections`:

```typescript
const { fieldSections, ... } = useCardItemHelpers(def, FIELD_CONFIG);

// fieldSections structure:
[
  {
    title: "Section Title",
    className: "bg-slate-50/70",
    fields: [FormDef, FormDef, ...] // Filtered field definitions
  },
  ...
]
```

### Rendering Logic

1. If `fieldSections.length > 0`, render section-based layout
2. Otherwise, fall back to flat `infoGridFields` layout
3. Each section filters out empty fields based on `hideEmptyFields` prop
4. Empty sections are not rendered

## Best Practices

1. **Group Related Fields**: Put logically related fields in the same section
2. **Limit Section Count**: 2-4 sections work best for readability
3. **Meaningful Titles**: Use clear, concise section titles
4. **Consistent Styling**: Use similar `className` patterns across cards
5. **Test Empty States**: Verify behavior when `hideEmptyFields={true}`

## See Also

- `useCardItemHelpers.ts` - Core hook implementation
- `ProductionOrderItemsCard.tsx` - Similar card component (potential migration candidate)
- `CardSection.tsx` - Base section component
