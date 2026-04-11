/**
 * Native React Native Select — mirrors antd Select API.
 * Web platform uses antd Select directly (see index.web.tsx).
 */
import React, {
  ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { ViewStyle } from "react-native";
import {
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/mini";

// ─── Public types ─────────────────────────────────────────────────────────────

export type RawValue = string | number;

export interface FieldNames {
  value?: string;
  label?: string;
  groupLabel?: string;
  /** Key for nested option groups. Default: "children" */
  options?: string;
}

export interface BaseOptionType {
  disabled?: boolean;
  title?: string;
  [key: string]: any;
}

export interface DefaultOptionType extends BaseOptionType {
  label?: ReactNode;
  value?: RawValue | null;
  children?: DefaultOptionType[];
}

export interface LabeledValue {
  key?: string;
  value: RawValue;
  label: ReactNode;
}

export interface CustomTagProps {
  label: ReactNode;
  value: RawValue;
  disabled: boolean;
  onClose: () => void;
  closable: boolean;
  index: number;
}

export type SelectValue =
  | RawValue
  | RawValue[]
  | LabeledValue
  | LabeledValue[]
  | null
  | undefined;

export interface SelectRef {
  focus: () => void;
  blur: () => void;
}

export interface SelectProps<
  VT = SelectValue,
  OT extends BaseOptionType = DefaultOptionType,
> {
  // ── Value ──
  /** Controlled value */
  value?: VT | null;
  /** Uncontrolled initial value */
  defaultValue?: VT | null;
  /** Return { value, label } in onChange instead of plain value */
  labelInValue?: boolean;

  // ── Options ──
  options?: OT[];
  /** Custom field name mapping (value/label/groupLabel/options) */
  fieldNames?: FieldNames;
  /** Highlight first option when nothing is selected */
  defaultActiveFirstOption?: boolean;
  /** Which field to show as the label in the trigger (default: label) */
  optionLabelProp?: string;

  // ── Mode ──
  /** "multiple": multi-select from options. "tags": multi-select + create new values */
  mode?: "multiple" | "tags";

  // ── Events ──
  onChange?: (value: VT, option: OT | OT[]) => void;
  onClear?: () => void;
  onSelect?: (value: RawValue | LabeledValue, option: OT) => void;
  onDeselect?: (value: RawValue | LabeledValue, option: OT) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onOpenChange?: (open: boolean) => void;

  // ── Open state ──
  open?: boolean;
  defaultOpen?: boolean;

  // ── State flags ──
  disabled?: boolean;
  loading?: boolean;

  // ── Appearance ──
  placeholder?: ReactNode;
  size?: "large" | "middle" | "small";
  variant?: "outlined" | "filled" | "borderless";
  /** Validation status — adds colored border */
  status?: "error" | "warning";
  /** Show clear button. Pass { clearIcon } to customize the icon */
  allowClear?: boolean | { clearIcon?: ReactNode };

  // ── Search ──
  /** Show search input inside the dropdown sheet */
  showSearch?: boolean;
  /**
   * - true (default): filter options by label text
   * - false: disable filtering
   * - function: custom filter predicate
   */
  filterOption?: boolean | ((inputValue: string, option: OT) => boolean);
  /** Custom sort for filtered results */
  filterSort?: (a: OT, b: OT, info: { searchValue: string }) => number;
  /** Controlled search text */
  searchValue?: string;
  /** Clear search after selecting an option (default: true) */
  autoClearSearchValue?: boolean;
  onSearch?: (value: string) => void;
  /** Which field to match when filtering (default: label field) */
  optionFilterProp?: string;

  // ── Multiple / Tags ──
  /** Max number of values that can be selected */
  maxCount?: number;
  /** Max number of tags shown in the trigger before collapsing */
  maxTagCount?: number;
  /** Truncate tag label text to N characters */
  maxTagTextLength?: number;
  /** Custom placeholder for collapsed tags. Function receives omitted items */
  maxTagPlaceholder?: ReactNode | ((omitted: LabeledValue[]) => ReactNode);

  // ── Custom rendering ──
  optionRender?: (option: OT, info: { index: number }) => ReactNode;
  labelRender?: (props: LabeledValue) => ReactNode;
  tagRender?: (props: CustomTagProps) => React.ReactElement;
  /** Custom selected-checkmark icon. Pass null to hide */
  menuItemSelectedIcon?: ReactNode | ((props: { isSelected: boolean }) => ReactNode);
  removeIcon?: ReactNode;
  /** Replaces the default chevron. Pass null to hide */
  suffixIcon?: ReactNode | null;
  prefix?: ReactNode;

  // ── Empty state ──
  notFoundContent?: ReactNode;

  // ── Dropdown customisation ──
  /** Customize dropdown content. Receives default menu node, return new node. */
  dropdownRender?: (menu: ReactNode) => ReactNode;

  // ── Style ──
  style?: ViewStyle;
  className?: string;
}

// ─── Internal types ───────────────────────────────────────────────────────────

type ResolvedFN = Required<FieldNames>;

type FlatItem =
  | { kind: "option"; option: any; index: number }
  | { kind: "group"; label: ReactNode; gkey: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const SZ = {
  large:  { height: 40, fontSize: 16, tagFontSize: 13, px: 11, iconSize: 16, tagH: 24, searchFontSize: 15 },
  middle: { height: 32, fontSize: 14, tagFontSize: 12, px: 11, iconSize: 14, tagH: 20, searchFontSize: 14 },
  small:  { height: 24, fontSize: 12, tagFontSize: 11, px:  7, iconSize: 12, tagH: 16, searchFontSize: 13 },
} as const;

const C = {
  primary:       "#1677ff",
  primaryLight:  "#e6f4ff",
  errorBorder:   "#ff4d4f",
  errorBg:       "#fff2f0",
  warningBorder: "#faad14",
  warningBg:     "#fffbe6",
  border:        "#d9d9d9",
  text:          "rgba(0,0,0,0.88)",
  textSub:       "rgba(0,0,0,0.45)",
  textMuted:     "rgba(0,0,0,0.25)",
  disabled:      "rgba(0,0,0,0.04)",
  pressed:       "rgba(0,0,0,0.04)",
  overlay:       "rgba(0,0,0,0.45)",
  tagBg:         "rgba(0,0,0,0.06)",
  white:         "#fff",
  handle:        "#e2e2e2",
  groupText:     "rgba(0,0,0,0.45)",
  searchBg:      "rgba(0,0,0,0.04)",
} as const;

// ─── Utilities ────────────────────────────────────────────────────────────────

function resolveFN(fieldNames?: FieldNames): ResolvedFN {
  return {
    value:      fieldNames?.value      ?? "value",
    label:      fieldNames?.label      ?? "label",
    groupLabel: fieldNames?.groupLabel ?? "label",
    options:    fieldNames?.options    ?? "children",
  };
}

function flattenOptions(raw: any[], fn: ResolvedFN): FlatItem[] {
  const result: FlatItem[] = [];
  let idx = 0;
  for (const opt of raw) {
    const children = opt[fn.options];
    if (Array.isArray(children) && children.length > 0) {
      result.push({ kind: "group", label: opt[fn.groupLabel] ?? opt[fn.label], gkey: `g_${idx}` });
      for (const child of children) {
        result.push({ kind: "option", option: child, index: idx++ });
      }
    } else {
      result.push({ kind: "option", option: opt, index: idx++ });
    }
  }
  return result;
}

function getRawValue(opt: any, fn: ResolvedFN): RawValue {
  return opt[fn.value] ?? opt.value;
}

function getLabel(opt: any, fn: ResolvedFN, labelProp?: string): ReactNode {
  const prop = labelProp ?? fn.label;
  return opt[prop] ?? opt[fn.label] ?? opt.label;
}

function getFilterText(opt: any, fn: ResolvedFN, filterProp?: string): string {
  const prop = filterProp ?? fn.label;
  const v = opt[prop] ?? opt.label ?? opt.value;
  return typeof v === "string" ? v : String(v ?? "");
}

function truncateLabel(label: ReactNode, maxLen?: number): ReactNode {
  if (!maxLen || typeof label !== "string") return label;
  return label.length > maxLen ? label.slice(0, maxLen) + "…" : label;
}

function toRawValues(val: SelectValue, multi: boolean): RawValue[] {
  if (val == null) return [];
  if (multi) {
    if (!Array.isArray(val)) return [];
    return (val as any[]).map((v) =>
      v != null && typeof v === "object" && "value" in v ? v.value : v,
    );
  }
  if (val != null && typeof val === "object" && "value" in (val as any)) {
    return [(val as LabeledValue).value];
  }
  return val != null ? [val as RawValue] : [];
}

function buildChangeValue(
  rawVals: RawValue[],
  allOpts: any[],
  fn: ResolvedFN,
  multi: boolean,
  labelInValue: boolean,
): SelectValue {
  if (!multi) {
    const v = rawVals[0] ?? null;
    if (!labelInValue) return v;
    if (v == null) return null;
    const opt = allOpts.find((o) => getRawValue(o, fn) === v);
    return { value: v, label: getLabel(opt, fn) } as LabeledValue;
  }
  if (!labelInValue) return rawVals;
  return rawVals.map((v) => {
    const opt = allOpts.find((o) => getRawValue(o, fn) === v);
    return { value: v, label: getLabel(opt, fn) } as LabeledValue;
  });
}

// ─── SelectTag sub-component ──────────────────────────────────────────────────

const SelectTag = React.memo(function SelectTag({
  label,
  onClose,
  closable,
  disabled,
  tagH,
  tagFontSize,
  removeIcon,
}: {
  label: ReactNode;
  onClose: () => void;
  closable: boolean;
  disabled: boolean;
  tagH: number;
  tagFontSize: number;
  removeIcon?: ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.tagBg,
        borderRadius: 4,
        height: tagH,
        paddingStart: 6,
        paddingEnd: closable && !disabled ? 2 : 6,
        marginEnd: 4,
        marginVertical: 2,
      }}
    >
      <Text
        numberOfLines={1}
        style={{ fontSize: tagFontSize, color: disabled ? C.textMuted : C.text, maxWidth: 160 }}
      >
        {typeof label === "string" || typeof label === "number" ? String(label) : ""}
      </Text>
      {closable && !disabled && (
        <Pressable onPress={onClose} hitSlop={8} style={{ padding: 2, marginStart: 2 }}>
          {removeIcon ?? <XMarkIcon size={tagFontSize - 2} color={C.textSub} />}
        </Pressable>
      )}
    </View>
  );
});

// ─── Main Select component ────────────────────────────────────────────────────

function SelectInner<VT = SelectValue, OT extends BaseOptionType = DefaultOptionType>(
  props: SelectProps<VT, OT>,
  ref: React.Ref<SelectRef>,
) {
  const {
    value,
    defaultValue,
    labelInValue = false,
    options = [] as unknown as OT[],
    fieldNames,
    optionLabelProp,
    mode,
    onChange,
    onClear,
    onSelect,
    onDeselect,
    onFocus,
    onBlur,
    onOpenChange,
    open: controlledOpen,
    defaultOpen = false,
    disabled = false,
    loading = false,
    placeholder = "Select...",
    size = "middle",
    variant = "outlined",
    status,
    allowClear = false,
    showSearch = false,
    filterOption,
    filterSort,
    searchValue: controlledSearch,
    autoClearSearchValue = true,
    onSearch,
    optionFilterProp,
    maxCount,
    maxTagCount,
    maxTagTextLength,
    maxTagPlaceholder,
    optionRender,
    labelRender,
    tagRender,
    menuItemSelectedIcon,
    removeIcon,
    suffixIcon,
    prefix,
    notFoundContent,
    dropdownRender,
    style,
  } = props;

  const isMultiple = mode === "multiple" || mode === "tags";
  const fn = useMemo(() => resolveFN(fieldNames), [fieldNames]);
  const sz = SZ[size];

  // ── Open state ─────────────────────────────────────────────────────────────
  const isCtrlOpen = controlledOpen !== undefined;
  const [intOpen, setIntOpen] = useState(defaultOpen);
  const open = isCtrlOpen ? controlledOpen! : intOpen;

  const triggerOpen = useCallback(
    (v: boolean) => {
      if (!isCtrlOpen) setIntOpen(v);
      onOpenChange?.(v);
      if (v) onFocus?.();
      else onBlur?.();
    },
    [isCtrlOpen, onOpenChange, onFocus, onBlur],
  );

  useImperativeHandle(ref, () => ({
    focus: () => triggerOpen(true),
    blur:  () => triggerOpen(false),
  }));

  // ── Value state ────────────────────────────────────────────────────────────
  const isCtrlValue = value !== undefined;
  const [intValue, setIntValue] = useState<SelectValue>(
    defaultValue != null
      ? (defaultValue as SelectValue)
      : isMultiple
      ? []
      : null,
  );
  const currentRaw = useMemo(
    () => toRawValues(isCtrlValue ? (value as SelectValue) : intValue, isMultiple),
    [isCtrlValue, value, intValue, isMultiple],
  );

  // ── Search state ───────────────────────────────────────────────────────────
  const isCtrlSearch = controlledSearch !== undefined;
  const [intSearch, setIntSearch] = useState("");
  const searchText = isCtrlSearch ? controlledSearch! : intSearch;

  const updateSearch = useCallback(
    (text: string) => {
      if (!isCtrlSearch) setIntSearch(text);
      onSearch?.(text);
    },
    [isCtrlSearch, onSearch],
  );

  // ── Flatten options ────────────────────────────────────────────────────────
  const flatItems = useMemo(
    () => flattenOptions(options as any[], fn),
    [options, fn],
  );

  const allRawOpts = useMemo(
    () => flatItems.filter((i) => i.kind === "option").map((i) => (i as any).option),
    [flatItems],
  );

  // ── Filtered + sorted display items ───────────────────────────────────────
  const displayItems = useMemo<FlatItem[]>(() => {
    const q = searchText.trim().toLowerCase();
    const hasQ = Boolean(q);

    // Determine which flat items to show
    let items: FlatItem[];
    if (!hasQ) {
      items = flatItems;
    } else {
      // When searching: hide group headers, show only matching options
      items = flatItems.filter((item) => {
        if (item.kind === "group") return false;
        if (filterOption === false) return true;
        if (typeof filterOption === "function")
          return (filterOption as any)(searchText, item.option);
        return getFilterText(item.option, fn, optionFilterProp)
          .toLowerCase()
          .includes(q);
      });
    }

    // Apply filterSort when provided (only on option items)
    if (filterSort) {
      const optItems = items.filter((i) => i.kind === "option");
      const sorted = optItems
        .map((i) => (i as any).option)
        .sort((a: any, b: any) => (filterSort as any)(a, b, { searchValue: searchText }));
      return sorted.map((opt: any, i: number) => ({
        kind: "option" as const,
        option: opt,
        index: i,
      }));
    }

    return items;
  }, [flatItems, searchText, filterOption, filterSort, fn, optionFilterProp]);

  // ── Tags mode: can create new entry ───────────────────────────────────────
  const canCreate =
    mode === "tags" &&
    searchText.trim().length > 0 &&
    !allRawOpts.some(
      (o) =>
        getFilterText(o, fn, optionFilterProp).toLowerCase() ===
        searchText.trim().toLowerCase(),
    ) &&
    !currentRaw.includes(searchText.trim());

  // ── Commit helpers ─────────────────────────────────────────────────────────
  const commitValue = useCallback(
    (newRaw: RawValue[], newOpts: any[]) => {
      const newVal = buildChangeValue(newRaw, allRawOpts, fn, isMultiple, labelInValue);
      if (!isCtrlValue) setIntValue(newVal);
      onChange?.(newVal as VT, (isMultiple ? newOpts : newOpts[0] ?? null) as any);
    },
    [allRawOpts, fn, isMultiple, labelInValue, isCtrlValue, onChange],
  );

  const handleSelect = useCallback(
    (opt: any) => {
      if (opt?.disabled) return;
      const v = getRawValue(opt, fn);

      if (isMultiple) {
        if (maxCount != null && currentRaw.length >= maxCount && !currentRaw.includes(v)) return;
        let newRaw: RawValue[];
        if (currentRaw.includes(v)) {
          newRaw = currentRaw.filter((x) => x !== v);
          const lv = labelInValue ? { value: v, label: getLabel(opt, fn) } : v;
          onDeselect?.(lv as any, opt as OT);
        } else {
          newRaw = [...currentRaw, v];
          const lv = labelInValue ? { value: v, label: getLabel(opt, fn) } : v;
          onSelect?.(lv as any, opt as OT);
        }
        const newOpts = newRaw
          .map((rv) => allRawOpts.find((o) => getRawValue(o, fn) === rv))
          .filter(Boolean);
        commitValue(newRaw, newOpts);
        if (autoClearSearchValue) updateSearch("");
      } else {
        commitValue([v], [opt]);
        const lv = labelInValue ? { value: v, label: getLabel(opt, fn) } : v;
        onSelect?.(lv as any, opt as OT);
        triggerOpen(false);
        if (autoClearSearchValue) updateSearch("");
      }
    },
    [
      fn, isMultiple, maxCount, currentRaw, labelInValue, onDeselect, onSelect,
      allRawOpts, commitValue, autoClearSearchValue, updateSearch, triggerOpen,
    ],
  );

  const handleDeselect = useCallback(
    (v: RawValue) => {
      const newRaw = currentRaw.filter((x) => x !== v);
      const newOpts = newRaw
        .map((rv) => allRawOpts.find((o) => getRawValue(o, fn) === rv))
        .filter(Boolean);
      commitValue(newRaw, newOpts);
      const opt = allRawOpts.find((o) => getRawValue(o, fn) === v);
      if (opt) {
        const lv = labelInValue ? { value: v, label: getLabel(opt, fn) } : v;
        onDeselect?.(lv as any, opt as OT);
      }
    },
    [currentRaw, allRawOpts, fn, commitValue, labelInValue, onDeselect],
  );

  const handleClear = useCallback(() => {
    const emptyVal = isMultiple ? [] : null;
    if (!isCtrlValue) setIntValue(emptyVal);
    onChange?.(emptyVal as VT, (isMultiple ? [] : null) as any);
    onClear?.();
    updateSearch("");
  }, [isCtrlValue, isMultiple, onChange, onClear, updateSearch]);

  const handleCreateTag = useCallback(() => {
    const v = searchText.trim();
    if (!v) return;
    const syntheticOpt = { [fn.value]: v, [fn.label]: v };
    handleSelect(syntheticOpt);
  }, [searchText, fn, handleSelect]);

  // ── Appearance helpers ─────────────────────────────────────────────────────
  const borderStyle = useMemo(() => {
    const borderColor =
      status === "error"
        ? C.errorBorder
        : status === "warning"
        ? C.warningBorder
        : open
        ? C.primary
        : C.border;

    if (variant === "outlined")
      return {
        borderWidth: 1,
        borderColor,
        backgroundColor: disabled ? C.disabled : C.white,
      };
    if (variant === "filled")
      return {
        borderWidth: 0,
        backgroundColor:
          status === "error"
            ? C.errorBg
            : status === "warning"
            ? C.warningBg
            : open
            ? "rgba(0,0,0,0.06)"
            : C.disabled,
      };
    return { borderWidth: 0, backgroundColor: "transparent" };
  }, [variant, status, open, disabled]);

  const showClearBtn =
    !disabled &&
    !loading &&
    (allowClear === true || (allowClear != null && typeof allowClear === "object")) &&
    currentRaw.length > 0;

  const clearIcon =
    typeof allowClear === "object" && (allowClear as any)?.clearIcon
      ? (allowClear as any).clearIcon
      : <XMarkIcon size={sz.iconSize - 2} color={C.textMuted} />;

  // Visible tags (respects maxTagCount)
  const visibleTagValues = useMemo(() => {
    if (!isMultiple) return [];
    return typeof maxTagCount === "number"
      ? currentRaw.slice(0, maxTagCount)
      : currentRaw;
  }, [isMultiple, currentRaw, maxTagCount]);

  const hiddenCount =
    isMultiple && typeof maxTagCount === "number"
      ? Math.max(0, currentRaw.length - maxTagCount)
      : 0;

  // Single-mode selected label
  const renderSingleLabel = () => {
    const opt = allRawOpts.find((o) => getRawValue(o, fn) === currentRaw[0]);
    if (!opt && currentRaw.length === 0) {
      return (
        <Text style={{ fontSize: sz.fontSize, color: C.textMuted }} numberOfLines={1}>
          {typeof placeholder === "string" ? placeholder : "Select..."}
        </Text>
      );
    }
    if (labelRender && currentRaw[0] != null) {
      return labelRender({ value: currentRaw[0], label: getLabel(opt, fn, optionLabelProp) });
    }
    const label = opt ? getLabel(opt, fn, optionLabelProp) : currentRaw[0];
    if (label == null) return null;
    if (typeof label === "string" || typeof label === "number") {
      return (
        <Text
          style={{ fontSize: sz.fontSize, color: disabled ? C.textMuted : C.text }}
          numberOfLines={1}
        >
          {String(label)}
        </Text>
      );
    }
    return label as React.ReactElement;
  };

  // ── Sheet option renderer ──────────────────────────────────────────────────
  const showSearch_eff = showSearch || mode === "tags";

  const renderItem = useCallback(
    ({ item }: { item: FlatItem }) => {
      // Group header
      if (item.kind === "group") {
        return (
          <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
            <Text style={{ fontSize: 12, color: C.groupText, fontWeight: "500" }}>
              {typeof item.label === "string" ? item.label : ""}
            </Text>
          </View>
        );
      }

      const { option, index } = item;
      const v = getRawValue(option, fn);
      const isSelected = currentRaw.includes(v);
      const isDisabled = Boolean(option.disabled);

      const selectedIcon = (() => {
        if (menuItemSelectedIcon === null) return null;
        if (typeof menuItemSelectedIcon === "function")
          return menuItemSelectedIcon({ isSelected });
        if (menuItemSelectedIcon !== undefined) return menuItemSelectedIcon;
        return isSelected ? <CheckIcon size={16} color={C.primary} /> : null;
      })();

      return (
        <Pressable
          onPress={() => handleSelect(option)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: isDisabled
              ? "transparent"
              : isSelected
              ? C.primaryLight
              : pressed
              ? C.pressed
              : "transparent",
          })}
        >
          <View style={{ flex: 1 }}>
            {optionRender ? (
              optionRender(option as OT, { index })
            ) : (() => {
              const label = getLabel(option, fn, optionLabelProp);
              if (typeof label === "string" || typeof label === "number") {
                return (
                  <Text
                    style={{
                      fontSize: 15,
                      color: isDisabled ? C.textMuted : isSelected ? C.primary : C.text,
                      fontWeight: isSelected ? "500" : "400",
                    }}
                  >
                    {String(label)}
                  </Text>
                );
              }
              return label as React.ReactElement ?? null;
            })()}
          </View>
          {selectedIcon}
        </Pressable>
      );
    },
    [currentRaw, fn, handleSelect, optionRender, optionLabelProp, menuItemSelectedIcon],
  );

  const keyExtractor = useCallback(
    (item: FlatItem, i: number) =>
      item.kind === "group"
        ? item.gkey
        : `opt_${String(getRawValue((item as any).option, fn))}_${i}`,
    [fn],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View>
      {/* ── Trigger ─────────────────────────────────────────────────────── */}
      <Pressable
        onPress={() => !disabled && !loading && triggerOpen(true)}
        style={[
          {
            minHeight: sz.height,
            paddingHorizontal: sz.px,
            paddingVertical: isMultiple ? 4 : 0,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: isMultiple ? "flex-start" : "center",
          },
          borderStyle,
          style,
        ]}
      >
        {/* Prefix */}
        {prefix != null && (
          <View style={{ marginEnd: 6, alignSelf: "center" }}>
            {typeof prefix === "string"
              ? <Text style={{ fontSize: sz.fontSize, color: C.textSub }}>{prefix}</Text>
              : prefix}
          </View>
        )}

        {/* Tags (multiple) */}
        {isMultiple ? (
          <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
            {visibleTagValues.map((v, i) => {
              const opt = allRawOpts.find((o) => getRawValue(o, fn) === v);
              const rawLabel = opt
                ? getLabel(opt, fn, optionLabelProp)
                : String(v);
              const label = truncateLabel(rawLabel, maxTagTextLength);

              if (tagRender) {
                return tagRender({
                  label,
                  value: v,
                  disabled,
                  onClose: () => handleDeselect(v),
                  closable: !disabled,
                  index: i,
                });
              }
              return (
                <SelectTag
                  key={String(v)}
                  label={label}
                  onClose={() => handleDeselect(v)}
                  closable={!disabled}
                  disabled={disabled}
                  tagH={sz.tagH}
                  tagFontSize={sz.tagFontSize}
                  removeIcon={removeIcon}
                />
              );
            })}

            {/* Collapsed count */}
            {hiddenCount > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", height: sz.tagH, marginEnd: 4, marginVertical: 2 }}>
                {maxTagPlaceholder ? (
                  typeof maxTagPlaceholder === "function" ? (() => {
                    const omitted = currentRaw.slice(maxTagCount as number).map((v) => {
                      const opt = allRawOpts.find((o) => getRawValue(o, fn) === v);
                      return { value: v, label: opt ? getLabel(opt, fn) : String(v) } as LabeledValue;
                    });
                    const node = (maxTagPlaceholder as Function)(omitted);
                    return typeof node === "string"
                      ? <Text style={{ fontSize: sz.tagFontSize, color: C.textSub }}>{node}</Text>
                      : (node as React.ReactElement);
                  })()
                  : typeof maxTagPlaceholder === "string"
                  ? <Text style={{ fontSize: sz.tagFontSize, color: C.textSub }}>{maxTagPlaceholder}</Text>
                  : (maxTagPlaceholder as React.ReactElement)
                ) : (
                  <Text style={{ fontSize: sz.tagFontSize, color: C.textSub }}>+ {hiddenCount} more</Text>
                )}
              </View>
            )}

            {/* Empty placeholder */}
            {currentRaw.length === 0 && (
              <Text style={{ fontSize: sz.fontSize, color: C.textMuted }}>
                {typeof placeholder === "string" ? placeholder : "Select..."}
              </Text>
            )}
          </View>
        ) : (
          /* Single label */
          <View style={{ flex: 1, overflow: "hidden" }}>{renderSingleLabel()}</View>
        )}

        {/* Suffix area */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginStart: 4, alignSelf: "center" }}>
          {loading && (
            <ActivityIndicator size="small" color={C.primary} style={{ width: sz.iconSize, height: sz.iconSize }} />
          )}
          {!loading && showClearBtn && (
            <Pressable onPress={handleClear} hitSlop={8}>
              {clearIcon}
            </Pressable>
          )}
          {!loading && suffixIcon !== null && (
            suffixIcon !== undefined ? (
              typeof suffixIcon === "string"
                ? <Text style={{ color: C.textSub }}>{suffixIcon}</Text>
                : (suffixIcon as React.ReactElement)
            ) : (
              <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}>
                <ChevronDownIcon size={sz.iconSize} color={disabled ? C.textMuted : C.textSub} />
              </View>
            )
          )}
        </View>
      </Pressable>

      {/* ── Bottom sheet modal ───────────────────────────────────────────── */}
      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: C.overlay, justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => triggerOpen(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View
              style={{
                backgroundColor: C.white,
                borderTopLeftRadius: 14,
                borderTopRightRadius: 14,
                paddingBottom: 32,
                maxHeight: 480,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {/* Handle bar */}
              <View style={{ alignItems: "center", paddingTop: 10, paddingBottom: 4 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: C.handle }} />
              </View>

              {/* Search / tags input */}
              {showSearch_eff && (
                <View style={{ marginHorizontal: 12, marginBottom: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: C.searchBg,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                    }}
                  >
                    <MagnifyingGlassIcon size={15} color={C.textSub} />
                    <TextInput
                      value={searchText}
                      onChangeText={updateSearch}
                      placeholder={mode === "tags" ? "Search or create..." : "Search..."}
                      placeholderTextColor={C.textMuted}
                      style={{
                        flex: 1,
                        marginStart: 6,
                        fontSize: sz.searchFontSize,
                        color: C.text,
                        padding: 0,
                      }}
                      autoFocus
                    />
                    {searchText.length > 0 && (
                      <Pressable onPress={() => updateSearch("")} hitSlop={8}>
                        <XMarkIcon size={14} color={C.textMuted} />
                      </Pressable>
                    )}
                  </View>
                </View>
              )}

              {/* Tags mode: create option */}
              {canCreate && (
                <Pressable
                  onPress={handleCreateTag}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    backgroundColor: pressed ? C.pressed : "transparent",
                  })}
                >
                  <Text style={{ fontSize: 15, color: C.primary }}>
                    + Create "{searchText.trim()}"
                  </Text>
                </Pressable>
              )}

              {/* Option list */}
              {(() => {
                const menu =
                  displayItems.length === 0 && !canCreate ? (
                    <View style={{ padding: 24, alignItems: "center" }}>
                      {notFoundContent ?? (
                        <Text style={{ color: C.textMuted, fontSize: 14 }}>No data</Text>
                      )}
                    </View>
                  ) : (
                    <FlatList
                      data={displayItems}
                      keyExtractor={keyExtractor}
                      renderItem={renderItem}
                      keyboardShouldPersistTaps="always"
                    />
                  );
                return dropdownRender ? dropdownRender(menu) : menu;
              })()}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── forwardRef wrapper ───────────────────────────────────────────────────────

const Select = React.forwardRef(SelectInner) as <
  VT = SelectValue,
  OT extends BaseOptionType = DefaultOptionType,
>(
  props: SelectProps<VT, OT> & { ref?: React.Ref<SelectRef> },
) => React.ReactElement;

// ─── Sub-components (antd compatibility) ──────────────────────────────────────

/** Declarative option — not rendered directly on native, use `options` prop instead */
function SelectOption(_props: DefaultOptionType & { children?: ReactNode }) {
  return null;
}
SelectOption.isSelectOption = true;

/** Declarative option group — not rendered directly on native, use nested `options` instead */
function SelectOptGroup(_props: { label?: ReactNode; children?: ReactNode }) {
  return null;
}
SelectOptGroup.isSelectOptGroup = true;

(Select as any).Option   = SelectOption;
(Select as any).OptGroup = SelectOptGroup;

export default Select;
export { SelectOption as Option, SelectOptGroup as OptGroup };
