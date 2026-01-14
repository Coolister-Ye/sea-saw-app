import View from "@/components/themed/View";
import Modal from "react-native-modal";
import Form from "./Form";
import useDataService from "@/hooks/useDataService";
import Toast from "@/components/themed/Toast";
import { router } from "expo-router";

type FormViewProps = {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  contentType: string;
  initialData?: any;
  fields: any[];
  onSuccess?: () => void;
};


export default function FormView({
  visible,
  onVisibleChange,
  contentType,
  fields,
  initialData,
  onSuccess,
}: FormViewProps) {

  const { getViewSet } = useDataService();

  const handleSubmit = async (formData: Record<string, any>) => {
    const id = initialData ? initialData.id : null;
    const viewSet = getViewSet(contentType);
    const response = id
      ? await viewSet.update({ id, body: formData })
      : await viewSet.create({ body: formData });

    if (response.status) {
      // Create or update successfully, close modal
      onVisibleChange(false);
      onSuccess && onSuccess();
    } else if (response.error?.isAuthError) {
      onVisibleChange(false);
      router.navigate("/login");
      console.error("Authenticate error:", response.error.message);
    } else {
      console.error("Create error:", response.error?.message);
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      className="m-0"
      style={{ margin: 0, alignItems: "flex-end" }}
    >
      {/* Error handling removed - ViewSet API throws errors that need to be caught */}

      <View className="h-full w-full sm:w-[550px] rounded-lg" variant="paper">
        <Form
          title={contentType}
          fields={fields}
          onCancel={() => onVisibleChange(false)}
          onSubmit={handleSubmit}
          data={initialData}
        />
      </View>
    </Modal>
  );
}
