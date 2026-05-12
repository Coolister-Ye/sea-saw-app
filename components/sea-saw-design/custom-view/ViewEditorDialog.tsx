import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
} from "antd";
import { DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import i18n from "@/locale/i18n";
import type { HeaderMetaProps } from "@/components/sea-saw-design/table/interface";
import type {
  CreateCustomViewPayload,
  CustomView,
  UpdateCustomViewPayload,
} from "@/hooks/useCustomViews";

// ── Public types ───────────────────────────────────────────────────────────────

export interface UserOption {
  id: number;
  username: string;
  role_name?: string;
}

export interface RoleOption {
  id: number;
  role_name: string;
}

export interface ViewEditorDialogProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  entity: string;
  initialView?: CustomView;
  headerMeta: Record<string, HeaderMetaProps>;
  currentParams: Record<string, any>;
  defaultColumnOrder: string[];
  onSave: (payload: CreateCustomViewPayload | UpdateCustomViewPayload) => Promise<void>;
  userOptions?: UserOption[];
  roleOptions?: RoleOption[];
}

// ── Internal types ─────────────────────────────────────────────────────────────

interface FilterRow {
  id: string;
  field: string;
  operation: string;
  value: string;
}

interface ColumnItem {
  key: string;
  label: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const OPERATION_LABELS: Record<string, string> = {
  exact: "=",
  iexact: "=",
  iexact_ex: "≠",
  icontains: "包含",
  icontains_ex: "不包含",
  startswith: "开头是",
  istartswith: "开头是",
  iendswith: "结尾是",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  isnull: "为空",
  isnull_ex: "不为空",
  in: "包含任意",
  range: "范围",
};

function parseParamsToRows(params: Record<string, any>): FilterRow[] {
  return Object.entries(params).map(([key, value], i) => {
    const dIdx = key.lastIndexOf("__");
    if (dIdx > 0) {
      return {
        id: `row-${i}-${Date.now()}`,
        field: key.substring(0, dIdx),
        operation: key.substring(dIdx + 2),
        value: String(value ?? ""),
      };
    }
    return { id: `row-${i}-${Date.now()}`, field: key, operation: "exact", value: String(value ?? "") };
  });
}

function buildParamsFromRows(rows: FilterRow[]): Record<string, any> {
  const params: Record<string, any> = {};
  rows.forEach((row) => {
    if (!row.field || row.value === "") return;
    const key = row.operation === "exact" ? row.field : `${row.field}__${row.operation}`;
    params[key] = row.value;
  });
  return params;
}

// ── SectionHeader ──────────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 13,
        fontWeight: 600,
        color: "#262626",
        marginTop: 24,
        marginBottom: 12,
        paddingBottom: 8,
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span>{title}</span>
      {action}
    </div>
  );
}

// ── FilterValueInput ───────────────────────────────────────────────────────────

function FilterValueInput({
  fieldMeta,
  operation,
  value,
  onChange,
}: {
  fieldMeta?: HeaderMetaProps;
  operation: string;
  value: string;
  onChange: (v: string) => void;
}) {
  if (operation === "isnull" || operation === "isnull_ex") {
    return (
      <Select
        style={{ width: "100%" }}
        value={value || undefined}
        onChange={onChange}
        options={[
          { value: "true", label: "是（为空）" },
          { value: "false", label: "否（非空）" },
        ]}
        allowClear
        size="small"
      />
    );
  }

  if (fieldMeta?.type === "choice" && fieldMeta.choices) {
    return (
      <Select
        style={{ width: "100%" }}
        value={value || undefined}
        onChange={onChange}
        options={fieldMeta.choices.map((c) => ({ value: String(c.value), label: c.label }))}
        allowClear
        placeholder="选择..."
        size="small"
      />
    );
  }

  if (fieldMeta?.type === "date") {
    return (
      <DatePicker
        style={{ width: "100%" }}
        value={value ? dayjs(value) : null}
        onChange={(_, dateStr) =>
          onChange(Array.isArray(dateStr) ? dateStr[0] : (dateStr as string))
        }
        format="YYYY-MM-DD"
        size="small"
      />
    );
  }

  if (fieldMeta?.type === "boolean") {
    return (
      <Select
        style={{ width: "100%" }}
        value={value || undefined}
        onChange={onChange}
        options={[
          { value: "true", label: "是" },
          { value: "false", label: "否" },
        ]}
        allowClear
        size="small"
      />
    );
  }

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={i18n.t("customView.inputValue")}
      size="small"
    />
  );
}

// ── FilterBuilderSection ───────────────────────────────────────────────────────

function FilterBuilderSection({
  headerMeta,
  rows,
  onChange,
}: {
  headerMeta: Record<string, HeaderMetaProps>;
  rows: FilterRow[];
  onChange: (rows: FilterRow[]) => void;
}) {
  const filterableFields = useMemo(
    () =>
      Object.entries(headerMeta)
        .filter(([, meta]) => meta.operations && meta.operations.length > 0)
        .map(([key, meta]) => ({ value: key, label: meta.label ?? key })),
    [headerMeta],
  );

  const addRow = useCallback(() => {
    const firstField = filterableFields[0]?.value ?? "";
    const firstOp = (firstField && headerMeta[firstField]?.operations?.[0]) ?? "exact";
    onChange([...rows, { id: `row-${Date.now()}`, field: firstField, operation: firstOp, value: "" }]);
  }, [rows, onChange, filterableFields, headerMeta]);

  const updateRow = useCallback(
    (id: string, updates: Partial<FilterRow>) => {
      onChange(rows.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    },
    [rows, onChange],
  );

  const removeRow = useCallback(
    (id: string) => onChange(rows.filter((r) => r.id !== id)),
    [rows, onChange],
  );

  const getOperationOptions = useCallback(
    (field: string) => {
      const ops = headerMeta[field]?.operations ?? ["exact"];
      return ops.map((op) => ({ value: op, label: OPERATION_LABELS[op] ?? op }));
    },
    [headerMeta],
  );

  return (
    <div>
      <SectionHeader title={i18n.t("customView.tabFilters")} />

      {rows.map((row, idx) => (
        <div key={row.id}>
          {idx > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  padding: "1px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#595959",
                  letterSpacing: "0.5px",
                }}
              >
                AND
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
            <div
              style={{
                width: 24,
                height: 24,
                border: "1px solid #d9d9d9",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "#8c8c8c",
                flexShrink: 0,
                background: "#fafafa",
              }}
            >
              {idx + 1}
            </div>

            <Select
              size="small"
              style={{ width: 160, flexShrink: 0 }}
              value={row.field || undefined}
              onChange={(val) =>
                updateRow(row.id, {
                  field: val,
                  operation: headerMeta[val]?.operations?.[0] ?? "exact",
                  value: "",
                })
              }
              options={filterableFields}
              placeholder={i18n.t("customView.selectField")}
              showSearch={{
                filterOption: (input: string, opt: any) =>
                  String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase()),
              }}
            />

            <Select
              size="small"
              style={{ width: 90, flexShrink: 0 }}
              value={row.operation || undefined}
              onChange={(val) => updateRow(row.id, { operation: val })}
              options={getOperationOptions(row.field)}
              placeholder={i18n.t("customView.selectOperator")}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <FilterValueInput
                fieldMeta={headerMeta[row.field]}
                operation={row.operation}
                value={row.value}
                onChange={(val) => updateRow(row.id, { value: val })}
              />
            </div>

            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => removeRow(row.id)}
              style={{ flexShrink: 0 }}
            />
          </div>
        </div>
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addRow}
        style={{ width: "100%", marginTop: 4 }}
        size="small"
      >
        {i18n.t("customView.addFilter")}
      </Button>
    </div>
  );
}

// ── ColumnPickerSection ────────────────────────────────────────────────────────

function ColumnPickerSection({
  headerMeta,
  defaultColumnOrder,
  value,
  onChange,
}: {
  headerMeta: Record<string, HeaderMetaProps>;
  defaultColumnOrder: string[];
  value: string[];
  onChange: (order: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const allColumns: ColumnItem[] = useMemo(() => {
    const base = defaultColumnOrder.length > 0 ? defaultColumnOrder : Object.keys(headerMeta);
    const extra = Object.keys(headerMeta).filter((k) => !base.includes(k));
    return [...base, ...extra]
      .filter((k) => headerMeta[k])
      .map((k) => ({ key: k, label: headerMeta[k]?.label ?? k }));
  }, [headerMeta, defaultColumnOrder]);

  const selectedColumns: ColumnItem[] = useMemo(() => {
    const effectiveOrder = value.length > 0 ? value : defaultColumnOrder;
    return effectiveOrder
      .filter((k) => headerMeta[k])
      .map((k) => ({ key: k, label: headerMeta[k]?.label ?? k }));
  }, [value, defaultColumnOrder, headerMeta]);

  const selectedSet = useMemo(() => new Set(selectedColumns.map((c) => c.key)), [selectedColumns]);

  const availableColumns = useMemo(
    () => allColumns.filter((c) => !selectedSet.has(c.key)),
    [allColumns, selectedSet],
  );

  const filteredAvailable = useMemo(
    () =>
      search
        ? availableColumns.filter((c) =>
            c.label.toLowerCase().includes(search.toLowerCase()),
          )
        : availableColumns,
    [availableColumns, search],
  );

  const addColumn = useCallback(
    (key: string) => onChange([...selectedColumns.map((c) => c.key), key]),
    [selectedColumns, onChange],
  );

  const removeColumn = useCallback(
    (key: string) => onChange(selectedColumns.filter((c) => c.key !== key).map((c) => c.key)),
    [selectedColumns, onChange],
  );

  const handleDragStart = useCallback((key: string) => setDragging(key), []);
  const handleDragEnd = useCallback(() => { setDragging(null); setDragOver(null); }, []);
  const handleDragOver = useCallback((e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOver(key);
  }, []);
  const handleDrop = useCallback(
    (targetKey: string) => {
      if (!dragging || dragging === targetKey) { setDragging(null); setDragOver(null); return; }
      const keys = selectedColumns.map((c) => c.key);
      const from = keys.indexOf(dragging);
      const to = keys.indexOf(targetKey);
      if (from < 0 || to < 0) return;
      const next = [...keys];
      next.splice(from, 1);
      next.splice(to, 0, dragging);
      onChange(next);
      setDragging(null);
      setDragOver(null);
    },
    [dragging, selectedColumns, onChange],
  );

  const handleReset = useCallback(() => onChange([]), [onChange]);

  const panelStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    border: "1px solid #f0f0f0",
    borderRadius: 6,
    overflow: "hidden",
    minHeight: 280,
  };

  const panelHeaderStyle: React.CSSProperties = {
    padding: "8px 12px",
    background: "#fafafa",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 12,
    fontWeight: 500,
    color: "#595959",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    maxHeight: 280,
  };

  return (
    <div>
      <SectionHeader title={i18n.t("customView.tabColumns")} />
      <div style={{ display: "flex", gap: 12 }}>
        {/* Available columns */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span>
              {i18n.t("customView.allColumns")}
              <span style={{ color: "#bfbfbf", marginLeft: 4 }}>({availableColumns.length})</span>
            </span>
          </div>
          <div style={{ padding: "6px 8px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
            <Input
              size="small"
              prefix={<SearchOutlined style={{ color: "#bfbfbf", fontSize: 12 }} />}
              placeholder="搜索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>
          <div style={listStyle}>
            {filteredAvailable.map((col) => (
              <div
                key={col.key}
                onClick={() => addColumn(col.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #fafafa",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#d9d9d9", fontSize: 13 }}>⠿</span>
                <span style={{ fontSize: 13, flex: 1, color: "#262626" }}>{col.label}</span>
              </div>
            ))}
            {filteredAvailable.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: "#bfbfbf", fontSize: 12 }}>
                {search ? "无匹配列" : "所有列已添加"}
              </div>
            )}
          </div>
        </div>

        {/* Selected columns */}
        <div style={panelStyle}>
          <div style={panelHeaderStyle}>
            <span>
              <span style={{ color: "#1677ff", marginRight: 4 }}>✓</span>
              {i18n.t("customView.visibleColumns")}
              <span style={{ color: "#bfbfbf", marginLeft: 4 }}>({selectedColumns.length})</span>
            </span>
            <span
              onClick={handleReset}
              style={{ fontSize: 11, color: "#1677ff", cursor: "pointer" }}
            >
              {i18n.t("customView.resetColumns")}
            </span>
          </div>
          <div style={listStyle}>
            {selectedColumns.map((col) => (
              <div
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(col.key)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDrop={() => handleDrop(col.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  cursor: "grab",
                  borderBottom: "1px solid #fafafa",
                  background:
                    dragOver === col.key
                      ? "#e6f4ff"
                      : dragging === col.key
                        ? "#f0f7ff"
                        : "transparent",
                  opacity: dragging === col.key ? 0.5 : 1,
                  transition: "background 0.1s",
                }}
              >
                <span style={{ color: "#bfbfbf", fontSize: 13, flexShrink: 0 }}>⠿</span>
                <span style={{ fontSize: 13, flex: 1, color: "#262626" }}>{col.label}</span>
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => { e.stopPropagation(); removeColumn(col.key); }}
                  style={{
                    color: "#bfbfbf",
                    padding: 0,
                    height: "auto",
                    minWidth: "auto",
                    lineHeight: 1,
                    fontSize: 16,
                  }}
                >
                  ×
                </Button>
              </div>
            ))}
            {selectedColumns.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: "#bfbfbf", fontSize: 12 }}>
                {i18n.t("customView.noColumnsSelected")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ViewEditorDialog({
  open,
  onClose,
  mode,
  entity,
  initialView,
  headerMeta,
  currentParams,
  defaultColumnOrder,
  onSave,
  userOptions = [],
  roleOptions = [],
}: ViewEditorDialogProps) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [filterRows, setFilterRows] = useState<FilterRow[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"private" | "shared" | "public">("private");
  const [sharedUsers, setSharedUsers] = useState<number[]>([]);
  const [sharedRoles, setSharedRoles] = useState<number[]>([]);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialView) {
      form.setFieldValue("name", initialView.name);
      setFilterRows(parseParamsToRows(initialView.params));
      setColumnOrder(initialView.column_order);
      setVisibility(initialView.visibility);
      setSharedUsers(initialView.shared_users);
      setSharedRoles(initialView.shared_roles);
      setIsDefault(initialView.is_default);
    } else {
      form.setFieldValue("name", "");
      setFilterRows(parseParamsToRows(currentParams));
      setColumnOrder([]);
      setVisibility("private");
      setSharedUsers([]);
      setSharedRoles([]);
      setIsDefault(false);
    }
  }, [open, mode, initialView, currentParams, form]);

  const handleSave = useCallback(async () => {
    try {
      await form.validateFields();
    } catch {
      return;
    }
    const name = (form.getFieldValue("name") as string)?.trim();
    if (!name) return;

    setSaving(true);
    try {
      await onSave({
        entity,
        name,
        params: buildParamsFromRows(filterRows),
        column_order: columnOrder,
        visibility,
        is_default: isDefault,
        shared_users: visibility === "shared" ? sharedUsers : [],
        shared_roles: visibility === "shared" ? sharedRoles : [],
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }, [form, entity, filterRows, columnOrder, visibility, isDefault, sharedUsers, sharedRoles, onSave, onClose]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={mode === "create" ? i18n.t("customView.newView") : i18n.t("customView.editView")}
      size={720}
      placement="right"
      destroyOnClose={false}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onClose}>{i18n.t("Cancel")}</Button>
          <Button type="primary" loading={saving} onClick={handleSave}>
            {i18n.t("Save")}
          </Button>
        </div>
      }
    >
      {/* View name */}
      <Form form={form} layout="vertical" style={{ marginBottom: 0 }}>
        <Form.Item
          name="name"
          label={i18n.t("customView.viewName")}
          rules={[{ required: true, message: i18n.t("customView.viewNameRequired") }]}
          style={{ marginBottom: 0 }}
        >
          <Input maxLength={100} autoFocus={mode === "create"} />
        </Form.Item>
      </Form>

      {/* Filter conditions */}
      <FilterBuilderSection
        headerMeta={headerMeta}
        rows={filterRows}
        onChange={setFilterRows}
      />

      {/* Column settings */}
      <ColumnPickerSection
        headerMeta={headerMeta}
        defaultColumnOrder={defaultColumnOrder}
        value={columnOrder}
        onChange={setColumnOrder}
      />

      {/* Sharing settings */}
      <div>
        <SectionHeader title={i18n.t("customView.tabSharing")} />
        <div style={{ marginBottom: 14 }}>
          <div style={{ marginBottom: 8, fontSize: 12, color: "#595959" }}>
            {i18n.t("customView.visibility")}
          </div>
          <Radio.Group value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Radio value="private">{i18n.t("customView.visibilityPrivate")}</Radio>
              <Radio value="shared">{i18n.t("customView.visibilityShared")}</Radio>
              <Radio value="public">{i18n.t("customView.visibilityPublic")}</Radio>
            </div>
          </Radio.Group>
        </div>

        {visibility === "shared" && (
          <>
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6, fontSize: 12, color: "#595959" }}>
                {i18n.t("customView.shareWithUsers")}
              </div>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                value={sharedUsers}
                onChange={setSharedUsers}
                options={userOptions.map((u) => ({
                  value: u.id,
                  label: u.role_name ? `${u.username} (${u.role_name})` : u.username,
                }))}
                placeholder={i18n.t("customView.shareWithUsersPlaceholder")}
                showSearch={{
                  filterOption: (input: string, option: any) =>
                    String(option?.label ?? "").toLowerCase().includes(input.toLowerCase()),
                }}
              />
            </div>
            <div>
              <div style={{ marginBottom: 6, fontSize: 12, color: "#595959" }}>
                {i18n.t("customView.shareWithRoles")}
              </div>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                value={sharedRoles}
                onChange={setSharedRoles}
                options={roleOptions.map((r) => ({ value: r.id, label: r.role_name }))}
                placeholder={i18n.t("customView.shareWithRolesPlaceholder")}
              />
            </div>
          </>
        )}
      </div>

      {/* Default view */}
      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
        <Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)}>
          <span style={{ fontSize: 13 }}>{i18n.t("customView.setDefault")}</span>
        </Checkbox>
      </div>
    </Drawer>
  );
}

export default ViewEditorDialog;
