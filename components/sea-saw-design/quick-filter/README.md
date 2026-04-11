# QuickFilter

横向滚动的快捷筛选栏，支持系统预设（下拉选择）和用户自定义预设（可删除 Chip），可与 `FilterPresetModal` 配合实现预设的保存流程。

---

## 目录结构

```
quick-filter/
├── types.ts               # QuickFilterOption / QuickFilterProps 类型定义
├── utils.ts               # resolveParams 工具函数
├── QuickFilter.tsx        # 主组件
├── FilterPresetModal.tsx  # 保存预设弹窗
└── index.ts               # 统一导出
```

---

## 组件概览

### `QuickFilter`

一个 `Select` 触发器，所有预设（系统 + 用户自定义）统一收进同一个下拉面板，内部分组展示：

```
┌─────────────────────────────┐
│  全部                       │  ← 系统预设（标准 options）
│  待处理                     │
│  今日                       │
│─────────────────────────────│
│  我的预设                   │  ← 分组标题
│  本月订单              [×]  │  ← 用户预设行（可删除）
│  VIP 客户              [×]  │
│─────────────────────────────│
│  ＋ 保存筛选                │  ← 可选入口
└─────────────────────────────┘
```

- 系统预设通过标准 `options` 渲染，由 Select 内置高亮/选中逻辑管理
- 用户预设通过 `dropdownRender` 附加到面板底部，自行渲染行样式与删除按钮
- 删除确认通过组件级 `AlertDialog`（受控）完成，不依赖嵌套 Modal

#### Props

```ts
interface QuickFilterProps {
  /** 系统内置预设列表 */
  options: QuickFilterOption[];

  /** 用户自定义预设列表，支持删除 */
  customOptions?: QuickFilterOption[];

  /** 当前激活的 key */
  activeKey: string;

  /** 切换预设时回调，返回 key 和解析后的 params */
  onChange: (key: string, params: Record<string, any>) => void;

  /** 点击"保存筛选"时回调，不传则不显示该入口 */
  onAddPreset?: () => void;
}
```

#### `QuickFilterOption`

```ts
interface QuickFilterOption {
  key: string;
  label: React.ReactNode;

  /**
   * 静态 params 对象，或工厂函数（用于日期相对筛选，每次点击时重新求值）
   * 例：() => ({ created_after: startOfToday() })
   */
  params: Record<string, any> | (() => Record<string, any>);

  /** 是否显示删除按钮，仅用户预设需要 */
  deletable?: boolean;

  /** 点击删除并确认后的回调 */
  onDelete?: () => void;
}
```

---

### `FilterPresetModal`

保存筛选预设的弹窗，输入预设名称后将当前 `params` 持久化。

#### Props

```ts
interface FilterPresetModalProps {
  open: boolean;
  onClose: () => void;

  /** 需要保存的筛选参数（即当前页面的 activeParams） */
  currentParams: Record<string, any>;

  /** 确认保存，返回 Promise，resolve 后弹窗自动重置 */
  onSave: (name: string, params: Record<string, any>) => Promise<void>;
}
```

#### 行为说明

- `currentParams` 为空对象时，保存按钮禁用，并提示"暂无筛选条件"
- 保存成功后名称输入框自动清空
- 点击遮罩或 Android 返回键均可关闭（触发 `onClose`）

---

## 典型用法

```tsx
import { useState } from "react";
import { QuickFilter, FilterPresetModal, QuickFilterOption } from "@/components/sea-saw-design/quick-filter";

const SYSTEM_OPTIONS: QuickFilterOption[] = [
  { key: "all",     label: "全部",   params: {} },
  { key: "pending", label: "待处理", params: { status: "pending" } },
  { key: "today",   label: "今日",   params: () => ({ created_after: new Date().toISOString().slice(0, 10) }) },
];

export function OrderListPage() {
  const [activeKey, setActiveKey] = useState("all");
  const [activeParams, setActiveParams] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  // 从后端加载的用户预设
  const [customOptions, setCustomOptions] = useState<QuickFilterOption[]>([]);

  const handleChange = (key: string, params: Record<string, any>) => {
    setActiveKey(key);
    setActiveParams(params);
    // 用 params 请求列表数据...
  };

  const handleSavePreset = async (name: string, params: Record<string, any>) => {
    // 调用 API 保存，然后刷新 customOptions
    await presetViewSet.create({ body: { name, params } });
    setModalOpen(false);
  };

  return (
    <>
      <QuickFilter
        options={SYSTEM_OPTIONS}
        customOptions={customOptions}
        activeKey={activeKey}
        onChange={handleChange}
        onAddPreset={() => setModalOpen(true)}
      />

      <FilterPresetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentParams={activeParams}
        onSave={handleSavePreset}
      />
    </>
  );
}
```

---

## 国际化

所有文案均通过 `i18n.t()` 读取，键名以 `quickFilter.` 为命名空间：

| Key | EN | ZH |
|-----|----|----|
| `quickFilter.saveFilter` | Save filter | 保存筛选 |
| `quickFilter.deletePreset` | Delete this preset? | 确认删除此预设？ |
| `quickFilter.savePresetTitle` | Save Filter Preset | 保存筛选预设 |
| `quickFilter.presetName` | Preset Name | 预设名称 |
| `quickFilter.presetNamePlaceholder` | Enter a name for this filter preset | 为该筛选预设起个名字 |
| `quickFilter.activeFilters` | Active Filters | 当前筛选条件 |
| `quickFilter.noActiveFilter` | No active filter to save… | 暂无筛选条件… |

`Cancel` / `Delete` / `Save` 复用全局键，无需在此命名空间下重复定义。

---

## 注意事项

- `params` 支持**工厂函数**形式，每次点击时求值，适合"今日""本周"等相对时间筛选，避免初始化时值已过期。
- `onAddPreset` 不传时，Select 下拉菜单底部的"保存筛选"入口不会渲染。
- 用户预设的 `deletable` 和 `onDelete` 需同时提供才会显示删除按钮。
