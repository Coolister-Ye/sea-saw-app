import { useState, useEffect, useCallback, useMemo } from "react";
import { Form, message } from "antd";
import type { FormInstance } from "antd";
import i18n from "@/locale/i18n";
import useDataService from "@/hooks/useDataService";
import { prepareRequestBody } from "@/utils/form";
import { devError } from "@/utils/logger";

interface UseOrderDrawerFormOptions {
  /** "nested" uses nestedViewSetKey with pipeline params; "standalone" uses standaloneViewSetKey directly */
  mode?: "nested" | "standalone";
  isOpen: boolean;
  data?: { id?: string | number; [key: string]: any };
  pipelineId?: string | number;
  /** ViewSet key for nested mode (e.g. "nestedPurchaseOrder") */
  nestedViewSetKey: string;
  /** ViewSet key for standalone mode (e.g. "purchaseOrder") */
  standaloneViewSetKey: string;
  /** Query param name for pipeline ID in nested mode (e.g. "pipeline" or "related_pipeline") */
  nestedParamName: string;
  /** Field name for pipeline ID in the request payload (default: "pipeline") */
  nestedPayloadKey?: string;
  /** Transform form values before sending to API. Should be wrapped in useCallback. */
  normalizePayload?: (values: any) => any;
  /** Default values to set when creating a new record. Can be a function for dynamic values (e.g. current date). */
  defaultValues?: Record<string, any> | (() => Record<string, any>);
  /** Entity name for error logging (e.g. "Purchase order") */
  entityName: string;
  onClose: (res?: any) => void;
  onCreate?: (res?: any) => void;
  onUpdate?: (res?: any) => void;
}

interface UseOrderDrawerFormReturn {
  form: FormInstance;
  loading: boolean;
  contextHolder: React.ReactElement;
  isEdit: boolean;
  handleSave: () => Promise<void>;
}

export default function useOrderDrawerForm({
  mode = "standalone",
  isOpen,
  data = {},
  pipelineId,
  nestedViewSetKey,
  standaloneViewSetKey,
  nestedParamName,
  nestedPayloadKey = "pipeline",
  normalizePayload,
  defaultValues,
  entityName,
  onClose,
  onCreate,
  onUpdate,
}: UseOrderDrawerFormOptions): UseOrderDrawerFormReturn {
  const { getViewSet } = useDataService();

  const viewSet = useMemo(
    () =>
      getViewSet(
        mode === "nested" ? nestedViewSetKey : standaloneViewSetKey,
      ),
    [getViewSet, mode, nestedViewSetKey, standaloneViewSetKey],
  );

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const isEdit = Boolean(data?.id);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit) {
      form.setFieldsValue(data);
    } else {
      form.resetFields();
      if (defaultValues) {
        const defaults =
          typeof defaultValues === "function"
            ? defaultValues()
            : defaultValues;
        form.setFieldsValue(defaults);
      }
    }
    // defaultValues is a static config, excluded from deps to avoid unnecessary re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, data, form]);

  const showMessage = useCallback(
    (type: "loading" | "success" | "error", content: string) => {
      messageApi.open({
        key: "save",
        type,
        content,
        duration: type === "loading" ? 0 : undefined,
      });
    },
    [messageApi],
  );

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      let payload = normalizePayload
        ? normalizePayload(values)
        : { ...values };

      showMessage("loading", i18n.t("saving"));

      // Nested mode: add pipelineId to payload and params
      const params: Record<string, any> = {};
      if (mode === "nested") {
        if (!pipelineId) {
          throw new Error("Pipeline ID is required for nested mode");
        }
        payload = { ...payload, [nestedPayloadKey]: pipelineId };
        params[nestedParamName] = pipelineId;
        params.return_related = "true";
      }

      const requestBody = prepareRequestBody(payload);

      const res = isEdit
        ? await viewSet.update({
            id: data.id!,
            body: requestBody,
            ...(mode === "nested" && { params }),
          })
        : await viewSet.create({
            body: requestBody,
            ...(mode === "nested" && { params }),
          });

      showMessage("success", i18n.t("save successfully"));

      if (isEdit) {
        onUpdate?.(res);
      } else {
        onCreate?.(res);
      }
      onClose(res);
    } catch (err: any) {
      devError(`${entityName} save failed:`, err);
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        i18n.t("Save failed");
      showMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    form,
    normalizePayload,
    showMessage,
    mode,
    pipelineId,
    nestedParamName,
    nestedPayloadKey,
    isEdit,
    viewSet,
    data,
    entityName,
    onUpdate,
    onCreate,
    onClose,
  ]);

  return {
    form,
    loading,
    contextHolder,
    isEdit,
    handleSave,
  };
}
