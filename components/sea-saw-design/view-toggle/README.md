# ViewToggle Component

A beautiful, reusable view toggle component with multiple variants and sizes. Perfect for switching between different view modes (card/table, grid/list, etc.).

## 📁 File Structure

```
view-toggle/
├── index.ts                  # Main export
├── ViewToggle.tsx            # Native implementation
├── ViewToggle.web.tsx        # Web implementation (with CSS transitions)
├── ViewToggle.example.tsx    # Usage examples
└── README.md                 # This file
```

## Features

- 🎨 **3 Visual Variants**: default, pill, minimal
- 📐 **3 Sizes**: sm, md, lg
- 🎯 **Type-safe**: Full TypeScript support with generics
- 📱 **Cross-platform**: Native and Web versions with optimized styles
- ✨ **Smooth Animations**: CSS transitions on web, optimized for native
- 🎭 **Icon Support**: Optional icons for each option
- 🔧 **Flexible**: Works with any string-based options

## Usage

### Basic Example

```tsx
import { ViewToggle } from "@/components/sea-saw-design/view-toggle";
import { AppstoreOutlined, TableOutlined } from "@ant-design/icons";

function MyComponent() {
  const [view, setView] = useState<"card" | "table">("table");

  return (
    <ViewToggle
      options={[
        {
          value: "card",
          label: "Card View",
          icon: <AppstoreOutlined />,
        },
        {
          value: "table",
          label: "Table View",
          icon: <TableOutlined />,
        },
      ]}
      value={view}
      onChange={setView}
    />
  );
}
```

### With i18n

```tsx
import { useLocale } from "@/context/Locale";

function MyComponent() {
  const { i18n } = useLocale();
  const [view, setView] = useState<"grid" | "list">("grid");

  const options = useMemo(
    () => [
      {
        value: "grid" as const,
        label: i18n.t("Grid View"),
        icon: <GridOutlined />,
      },
      {
        value: "list" as const,
        label: i18n.t("List View"),
        icon: <UnorderedListOutlined />,
      },
    ],
    [i18n]
  );

  return <ViewToggle options={options} value={view} onChange={setView} />;
}
```

### Different Sizes

```tsx
// Small
<ViewToggle options={options} value={view} onChange={setView} size="sm" />

// Medium (default)
<ViewToggle options={options} value={view} onChange={setView} size="md" />

// Large
<ViewToggle options={options} value={view} onChange={setView} size="lg" />
```

### Different Variants

```tsx
// Default - Clean, professional look with subtle shadows
<ViewToggle
  options={options}
  value={view}
  onChange={setView}
  variant="default"
/>

// Pill - Bold gradient background with vibrant active state
<ViewToggle options={options} value={view} onChange={setView} variant="pill" />

// Minimal - Understated with minimal styling
<ViewToggle
  options={options}
  value={view}
  onChange={setView}
  variant="minimal"
/>
```

### Without Icons

```tsx
<ViewToggle
  options={[
    { value: "card", label: "Card" },
    { value: "table", label: "Table" },
    { value: "grid", label: "Grid" },
  ]}
  value={view}
  onChange={setView}
/>
```

### Custom Type

```tsx
type CustomView = "kanban" | "timeline" | "calendar";

const [view, setView] = useState<CustomView>("kanban");

<ViewToggle<CustomView>
  options={[
    { value: "kanban", label: "Kanban", icon: <BoardIcon /> },
    { value: "timeline", label: "Timeline", icon: <TimelineIcon /> },
    { value: "calendar", label: "Calendar", icon: <CalendarIcon /> },
  ]}
  value={view}
  onChange={setView}
  variant="pill"
  size="lg"
/>;
```

## Props

| Prop       | Type                           | Default     | Description                                      |
| ---------- | ------------------------------ | ----------- | ------------------------------------------------ |
| `options`  | `ViewToggleOption<T>[]`        | required    | Array of toggle options                          |
| `value`    | `T`                            | required    | Currently selected value                         |
| `onChange` | `(value: T) => void`           | required    | Callback when selection changes                  |
| `size`     | `"sm" \| "md" \| "lg"`         | `"md"`      | Size of the toggle component                     |
| `variant`  | `"default" \| "pill" \| "minimal"` | `"default"` | Visual style variant                             |

### ViewToggleOption Type

```typescript
type ViewToggleOption<T extends string = string> = {
  value: T; // The value for this option
  label: string; // Display label
  icon?: React.ReactNode; // Optional icon
};
```

## Design Details

### Default Variant
- Gradient background (slate-50 to slate-100)
- Subtle border and shadow
- Active state: white with elevated shadow
- Blue accent color for active state

### Pill Variant
- Gradient background (blue-50 via indigo-50 to violet-50)
- Rounded pill shape
- Active state: vibrant blue-to-indigo gradient
- White text on active state
- Larger shadow and slight scale increase

### Minimal Variant
- Transparent background
- No borders
- Active state: light slate background
- Understated, minimal styling

## Platform Differences

- **Native**: Uses React Native's Pressable and View components
- **Web**: Uses HTML button and div with enhanced CSS transitions
- Both versions maintain visual consistency while optimizing for platform

## Accessibility

- Uses semantic button elements (web)
- Keyboard accessible
- Clear visual feedback for active state
- Touch-friendly hit areas

## Examples in Codebase

See [ProductItemsViewToggle.tsx](../../../sea-saw-page/crm/from/display/shared/items/ProductItemsViewToggle.tsx) for a real-world usage example.

## Development

To see all variants and examples, import and render the `ViewToggleExamples` component from `ViewToggle.example.tsx`:

```tsx
import { ViewToggleExamples } from "@/components/sea-saw-design/view-toggle/ViewToggle.example";

// In your playground or demo page
<ViewToggleExamples />
```
