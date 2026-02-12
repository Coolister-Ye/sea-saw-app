# Def 数据流重构方案

## 问题分析

### 当前数据流（存在冗余）

```
useEntityPage
  ↓ headerMeta → formDefs (Array)
pipeline.web.tsx
  ↓ useMemo: formDefs → categorized defs
  ↓ 传递完整 formDefs 给 PipelineDisplay
PipelineDisplay.tsx
  ↓ useMemo: 再次 pick & filter
  ↓ 传递单个 def 给各 Section
PipelineSection.tsx
  ↓ 透传 def
PipelineCard.tsx
  ↓ 透传 def
CardBase.tsx
  ↓ useCardItemHelpers(def, fieldConfig)
useCardItemHelpers.ts
  ↓ useFormDefs({ def })
useFormDefs.ts
  ↓ 再次提取 children, 转换为数组
  ↓ FormDef[]
```

### 核心问题

1. **重复转换**：数据被转换 3 次
   - pipeline.web.tsx: headerMeta → formDefs
   - PipelineDisplay.tsx: formDefs → categorized defs
   - useFormDefs: def → FormDef[]

2. **类型不明确**：
   - `def` 参数类型不一致（Array | Object | undefined）
   - 各层级对 `def` 的期待不同

3. **职责混乱**：
   - `useFormDefs` 既管网络请求，又管本地转换
   - `useCardItemHelpers` 只是简单包装

## 改进方案

### 方案 A：清晰的数据层级（推荐 ⭐）

#### 核心原则

1. **单一转换**：数据只在一个地方转换（useEntityPage / useFormDefs）
2. **明确类型**：每层明确数据格式
3. **职责分离**：
   - `useFormDefs` - 只负责从网络获取并转换
   - `useFieldHelpers` - 只负责计算 helpers
   - 页面组件 - 负责分类和传递

#### 数据层级定义

```typescript
// Level 1: Raw Meta (from backend)
type RawMeta = Record<string, HeaderMetaProps>;

// Level 2: Normalized FormDef Array
type FormDef[];

// Level 3: Categorized Defs (domain-specific)
interface PipelineDefs {
  base: FormDef[];
  order?: FormDef;
  productionOrders?: FormDef;
  // ...
}
```

#### 实施步骤

##### 1. 修改 useFormDefs - 移除 def 参数

```typescript
// hooks/useFormDefs.ts
/**
 * Fetch and normalize form definitions from backend
 * ONLY for network requests - no local def conversion
 */
export function useFormDefs({
  table,
  columnOrder
}: {
  table: string;
  columnOrder?: string[];
}) {
  const { getViewSet } = useDataService();
  const [formDefs, setFormDefs] = useState<FormDef[]>([]);

  const viewSet = useMemo(
    () => getViewSet(table),
    [getViewSet, table]
  );

  useEffect(() => {
    // Fetch from network only
    // ...
  }, [viewSet]);

  return formDefs;
}
```

##### 2. 新增 convertToFormDefs - 统一转换工具

```typescript
// utils/formDefUtils.ts
import type { HeaderMetaProps, FormDef } from "@/types";
import { normalizeBoolean } from "@/utils";

/**
 * Convert HeaderMeta to FormDef array
 * Centralized conversion logic
 */
export function convertToFormDefs(
  meta: Record<string, HeaderMetaProps> | any
): FormDef[] {
  // Handle already array
  if (Array.isArray(meta)) {
    return meta;
  }

  // Extract from nested structure
  const target = meta?.children || meta?.child?.children || meta;

  if (!target || typeof target !== 'object') {
    return [];
  }

  return Object.entries(target).map(([field, definitions]) => ({
    field,
    ...(definitions as HeaderMetaProps),
    required: normalizeBoolean((definitions as any).required),
    read_only: normalizeBoolean((definitions as any).read_only),
  }));
}

/**
 * Sort FormDefs by column order
 */
export function sortFormDefs(
  defs: FormDef[],
  columnOrder?: string[]
): FormDef[] {
  if (!columnOrder?.length) return defs;

  const orderMap = new Map(
    columnOrder.map((field, index) => [field, index])
  );

  return [...defs].sort((a, b) => {
    const orderA = orderMap.get(a.field);
    const orderB = orderMap.get(b.field);

    if (orderA !== undefined && orderB !== undefined) {
      return orderA - orderB;
    }
    if (orderA !== undefined) return -1;
    if (orderB !== undefined) return 1;
    return 0;
  });
}

/**
 * Pick specific field from FormDef array
 */
export function pickFormDef(
  defs: FormDef[],
  field: string
): FormDef | undefined {
  return defs.find(d => d.field === field);
}

/**
 * Filter FormDefs by exclusion list
 */
export function filterFormDefs(
  defs: FormDef[],
  exclude: string[]
): FormDef[] {
  return defs.filter(d => !exclude.includes(d.field));
}
```

##### 3. 修改 pipeline.web.tsx - 统一转换和分类

```typescript
// app/(app)/(pipeline)/pipeline.web.tsx
import { convertToFormDefs, pickFormDef, filterFormDefs } from "@/utils/formDefUtils";

export default function PipelineScreen() {
  const {
    headerMeta,
    // ... other props
  } = useEntityPage({
    entity: "pipeline",
    // ...
  });

  // 1. Convert once - from headerMeta to FormDef[]
  const formDefs = useMemo(
    () => convertToFormDefs(headerMeta?.actions?.POST),
    [headerMeta]
  );

  // 2. Categorize for domain use
  const categorizedDefs = useMemo((): PipelineDefs => ({
    base: filterFormDefs(formDefs, [
      "order", "production_orders", "purchase_orders",
      "outbound_orders", "payments", "allowed_actions"
    ]),
    order: pickFormDef(formDefs, "order"),
    productionOrders: pickFormDef(formDefs, "production_orders"),
    purchaseOrders: pickFormDef(formDefs, "purchase_orders"),
    outboundOrders: pickFormDef(formDefs, "outbound_orders"),
    payments: pickFormDef(formDefs, "payments"),
  }), [formDefs]);

  return (
    <>
      {/* Input - 只需要 base fields */}
      <PipelineInput
        isOpen={isEditOpen}
        def={categorizedDefs.base}  // FormDef[]
        // ...
      />

      {/* Display - 传递分类的 defs */}
      <PipelineDisplay
        isOpen={isViewOpen}
        defs={categorizedDefs}  // PipelineDefs
        data={viewRow}
        // ...
      />
    </>
  );
}
```

##### 4. 修改 PipelineDisplay - 使用分类的 defs

```typescript
// components/sea-saw-page/pipeline/display/PipelineDisplay.tsx
import type { PipelineDefs } from "./types";

interface PipelineDisplayProps {
  isOpen: boolean;
  defs: PipelineDefs;  // 👈 接收分类后的 defs
  data?: any;
  onClose: () => void;
  onCreate?: () => void;
  onUpdate?: () => void;
}

export default function PipelineDisplay({
  isOpen,
  defs,  // 已经分类好的
  data,
  onClose,
  onCreate,
  onUpdate,
}: PipelineDisplayProps) {
  const pipeline = data ?? {};

  // 不需要再次 pick & filter，直接使用
  const visibility = useMemo(() => ({
    hasOrders: Boolean(defs.order),
    hasProductionOrders: Boolean(defs.productionOrders),
    hasPurchaseOrders: Boolean(defs.purchaseOrders),
    hasOutboundOrders: Boolean(defs.outboundOrders),
    hasPayments: Boolean(defs.payments),
  }), [defs]);

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <PipelineSection
        def={defs.base}  // FormDef[]
        pipeline={pipeline}
        // ...
      />

      {visibility.hasOrders && (
        <OrdersSection
          def={defs.order?.children}  // FormDef[] | undefined
          orders={order ? [order] : []}
          // ...
        />
      )}
      {/* ... other sections */}
    </Drawer>
  );
}
```

##### 5. 修改 CardBase - 直接使用 FormDef[]

```typescript
// components/sea-saw-page/base/card/CardBase.tsx
import { useFieldHelpers, filterFieldsByConfig, filterVisibleFields } from "@/hooks/useFieldHelpers";
import { convertToFormDefs } from "@/utils/formDefUtils";

interface CardBaseProps {
  def: FormDef[] | any;  // 兼容过渡期
  // ...
}

export default function CardBase({
  def,
  fieldConfig,
  // ...
}: CardBaseProps) {
  // 1. Normalize def to array (过渡期兼容)
  const formDefs = useMemo(() => {
    if (Array.isArray(def)) return def;
    return convertToFormDefs(def);
  }, [def]);

  // 2. Use field helpers (pure computation)
  const {
    getChoiceLabel,
    renderFieldValue,
    getFieldLabel,
  } = useFieldHelpers(formDefs);

  // 3. Filter fields by config
  const { infoGridFields, fullWidthFields } = useMemo(
    () => filterFieldsByConfig(formDefs, fieldConfig || { exclude: [] }),
    [formDefs, fieldConfig]
  );

  // 4. Process sections
  const fieldSections = useMemo(() => {
    if (!fieldConfig?.sections) return [];
    return fieldConfig.sections.map(section => ({
      ...section,
      fields: formDefs.filter(f => section.fields.includes(f.field)),
    }));
  }, [formDefs, fieldConfig]);

  // ... render logic
}
```

##### 6. 移除 useCardItemHelpers

```typescript
// hooks/useCardItemHelpers.ts - DELETE THIS FILE
// 功能已拆分到：
// - useFieldHelpers.ts (pure computation)
// - formDefUtils.ts (conversion utilities)
```

### 方案 B：使用 Context（适合大型重构）

如果多个深层组件需要访问 formDefs：

```typescript
// contexts/FormDefsContext.tsx
export const FormDefsContext = createContext<{
  formDefs: FormDef[];
  categorized: PipelineDefs;
} | null>(null);

// pipeline.web.tsx
<FormDefsProvider value={{ formDefs, categorized: categorizedDefs }}>
  <PipelineDisplay ... />
</FormDefsProvider>

// CardBase.tsx
const { formDefs } = useFormDefsContext();
```

## 迁移策略

### 阶段 1：创建新工具（已完成 ✅）
- [x] 创建 `hooks/useFieldHelpers.ts`
- [x] 创建 `utils/formDefUtils.ts`（待创建）

### 阶段 2：逐步迁移组件
1. 先迁移 CardBase（影响范围大）
2. 再迁移各个 Display 组件
3. 最后迁移页面组件

### 阶段 3：清理旧代码
- 移除 useCardItemHelpers.ts
- 简化 useFormDefs.ts（移除 def 参数）

## 最终架构

```
useFormDefs (network only)
  ↓ FormDef[]

formDefUtils (conversion)
  ↓ convertToFormDefs, sortFormDefs, pickFormDef, filterFormDefs

pipeline.web.tsx (categorization)
  ↓ categorizedDefs: PipelineDefs

PipelineDisplay (distribution)
  ↓ defs.base, defs.order, ...

CardBase (consumption)
  ↓ useFieldHelpers(formDefs)
  ↓ Render
```

### 优势

1. ✅ **单一职责**：每个函数/hook 职责明确
2. ✅ **单次转换**：数据只在入口处转换一次
3. ✅ **类型明确**：每层数据格式清晰
4. ✅ **易于测试**：纯函数易于单元测试
5. ✅ **性能优化**：减少重复计算

## 下一步行动

你希望我：
1. **完成工具创建** - 创建 `formDefUtils.ts`
2. **示例迁移** - 迁移 CardBase 作为示例
3. **全量迁移** - 一次性迁移所有相关组件
4. **其他建议** - 如果你有其他想法

请告诉我你的选择！
