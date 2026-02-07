# Section 通用组件

这个文件夹包含可复用的 Section 组件，用于统一页面各个区块的样式和结构。

## 组件列表

### SectionWrapper
外层容器组件，提供统一的间距。

**Props:**
- `children: React.ReactNode` - 子内容
- `className?: string` - 自定义样式（默认: `"mb-8"`）

### SectionHeader
标题区域组件，包含图标、标题、副标题和右侧内容。

**Props:**
- `icon: React.ReactNode` - 图标组件
- `iconGradient: string` - 图标背景渐变色（格式: `"from-blue-500 to-blue-600"`）
- `iconShadow: string` - 图标阴影色（格式: `"shadow-blue-500/25"`）
- `title: string` - 标题文本
- `subtitle?: string` - 副标题（可选，如记录数量）
- `rightContent?: React.ReactNode` - 右侧内容（可选，如统计徽章）

### SectionStatsBadge
统计徽章组件，用于显示摘要信息。

**Props:**
- `icon: React.ReactNode` - 图标组件
- `label: string` - 统计文本

### SectionContentCard
内容卡片容器，提供统一的样式和装饰。

**Props:**
- `gradientColors: string` - 顶部渐变装饰线的颜色（格式: `"from-blue-400 via-blue-500 to-cyan-400"`）
- `children: React.ReactNode` - 卡片内容

## 使用示例

### 基础用法

```tsx
import {
  SectionWrapper,
  SectionHeader,
  SectionStatsBadge,
  SectionContentCard,
} from "@/components/sea-saw-page/base";
import { ShoppingCartIcon, CubeIcon } from "react-native-heroicons/outline";
import i18n from "@/locale/i18n";

export default function MySection() {
  const itemCount = 5;
  const totalItems = 10;

  return (
    <SectionWrapper>
      <SectionHeader
        icon={<ShoppingCartIcon size={20} color="#ffffff" />}
        iconGradient="from-blue-500 to-blue-600"
        iconShadow="shadow-blue-500/25"
        title={i18n.t("Orders")}
        subtitle={`${itemCount} ${i18n.t("record")}${itemCount > 1 ? "s" : ""}`}
        rightContent={
          <SectionStatsBadge
            icon={<CubeIcon size={14} color="#64748b" />}
            label={`${totalItems} ${i18n.t("items")}`}
          />
        }
      />

      <SectionContentCard gradientColors="from-blue-400 via-blue-500 to-cyan-400">
        {/* Your content here */}
      </SectionContentCard>
    </SectionWrapper>
  );
}
```

### 条件渲染

```tsx
// 只在有数据时显示副标题
const subtitle =
  orderCount > 0
    ? `${orderCount} ${i18n.t("record")}${orderCount > 1 ? "s" : ""}`
    : undefined;

// 只在有统计数据时显示徽章
const statsBadge =
  orderCount > 0 && totalItems > 0 ? (
    <SectionStatsBadge
      icon={<CubeIcon size={14} color="#64748b" />}
      label={`${totalItems} ${i18n.t("items")}`}
    />
  ) : undefined;

<SectionHeader
  icon={<ShoppingCartIcon size={20} color="#ffffff" />}
  iconGradient="from-blue-500 to-blue-600"
  iconShadow="shadow-blue-500/25"
  title={i18n.t("Orders")}
  subtitle={subtitle}
  rightContent={statsBadge}
/>
```

## 配色方案

常用的图标和渐变配色组合：

| 主题 | 图标渐变 | 图标阴影 | 装饰线渐变 |
|------|----------|----------|-----------|
| 蓝色（订单） | `from-blue-500 to-blue-600` | `shadow-blue-500/25` | `from-blue-400 via-blue-500 to-cyan-400` |
| 紫色（采购/管线） | `from-purple-500 to-purple-600` | `shadow-purple-500/25` | `from-purple-400 via-purple-500 to-indigo-400` 或 `to-pink-400` |
| 琥珀色（生产） | `from-amber-500 to-amber-600` | `shadow-amber-500/25` | `from-amber-400 via-amber-500 to-orange-400` |
| 绿色 | `from-green-500 to-green-600` | `shadow-green-500/25` | `from-green-400 via-green-500 to-emerald-400` |
| 红色 | `from-red-500 to-red-600` | `shadow-red-500/25` | `from-red-400 via-red-500 to-rose-400` |

## 重构现有 Section 的步骤

以 `PurchaseOrdersSection.tsx` 为例：

### 重构前
```tsx
return (
  <View className="mb-8">
    <View className="flex-row items-center justify-between mb-4">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 items-center justify-center shadow-lg shadow-purple-500/25">
          <ShoppingBagIcon size={20} color="#ffffff" />
        </View>
        <View>
          <Text className="text-lg font-semibold text-slate-800 tracking-tight" style={{ fontFamily: "System" }}>
            {i18n.t("Purchase Order")}
          </Text>
          {purchaseCount > 0 && (
            <Text className="text-xs text-slate-400 mt-0.5">
              {purchaseCount} {i18n.t("record")}{purchaseCount > 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>

      {purchaseCount > 0 && totalItems > 0 && (
        <View className="flex-row items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
          <CubeIcon size={14} color="#64748b" />
          <Text className="text-sm font-semibold text-slate-600 font-mono tracking-tight">
            {totalItems} {i18n.t("items")}
          </Text>
        </View>
      )}
    </View>

    <View className="rounded-2xl overflow-hidden border border-slate-200/60 bg-white" style={{ boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)" }}>
      <View className="h-1 bg-gradient-to-r from-purple-400 via-purple-500 to-pink-400" />
      <View className="p-1">
        {/* Content */}
      </View>
    </View>
  </View>
);
```

### 重构后
```tsx
// 1. 添加 imports
import {
  SectionWrapper,
  SectionHeader,
  SectionStatsBadge,
  SectionContentCard,
} from "@/components/sea-saw-page/base";

// 2. 移除不再需要的 imports
// import { View } from "react-native"; - 不需要了
// import { Text } from "@/components/sea-saw-design/text"; - 不需要了

// 3. 准备数据
const subtitle =
  purchaseCount > 0
    ? `${purchaseCount} ${i18n.t("record")}${purchaseCount > 1 ? "s" : ""}`
    : undefined;

const statsBadge =
  purchaseCount > 0 && totalItems > 0 ? (
    <SectionStatsBadge
      icon={<CubeIcon size={14} color="#64748b" />}
      label={`${totalItems} ${i18n.t("items")}`}
    />
  ) : undefined;

// 4. 使用新组件
return (
  <SectionWrapper>
    <SectionHeader
      icon={<ShoppingBagIcon size={20} color="#ffffff" />}
      iconGradient="from-purple-500 to-purple-600"
      iconShadow="shadow-purple-500/25"
      title={i18n.t("Purchase Order")}
      subtitle={subtitle}
      rightContent={statsBadge}
    />

    <SectionContentCard gradientColors="from-purple-400 via-purple-500 to-pink-400">
      {/* Content */}
    </SectionContentCard>
  </SectionWrapper>
);
```

## 已完成的重构

所有 Section 文件已使用通用组件完成重构：

- [x] `OrdersSection.tsx` - ✅ 已完成
- [x] `PipelineSection.tsx` - ✅ 已完成
- [x] `ProductionOrdersSection.tsx` - ✅ 已完成
- [x] `PurchaseOrdersSection.tsx` - ✅ 已完成

重构成果：
- ✅ 减少重复代码（每个文件减少约 20-30 行）
- ✅ 统一样式和结构
- ✅ 简化维护工作
- ✅ 提高代码可读性
- ✅ 更容易添加新的 Section
