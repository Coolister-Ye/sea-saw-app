import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { forwardRef, useState } from "react";
import { Checkbox } from "expo-checkbox";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { CSS } from "@dnd-kit/utilities";
import { BasicFrame } from "../sea/BasicFrame";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import View from "../themed/View";
import { useLocale } from "@/context/Locale";

// Type definition for ColumnsToolBar props
// ColumnsToolBar组件的Props类型定义
export type ColumnsToolBarProps = {
  columns: Array<{ id: string; label: string; hidden: boolean }>; // Columns data / 列数据
  onSubmit?: (
    values: Array<{ id: string; label: string; hidden: boolean }>
  ) => void; // Callback for submitting the columns' state / 提交列状态的回调
  onCancel?: () => void; // Callback for canceling the changes / 取消更改的回调
};

// ColumnsToolBar component that allows dragging and selecting columns
// 允许拖动和选择列的ColumnsToolBar组件
export function ColumnsToolBar({
  columns,
  onSubmit,
  onCancel,
}: ColumnsToolBarProps) {
  // Sort columns based on hidden state (hidden = true means column is hidden)
  // 根据hidden状态对列进行排序（hidden = true表示列被隐藏）
  const forwardChecked = (objs: any) =>
    [...objs].sort((a, b) => {
      const av = a.hidden ? 0 : 1;
      const bv = b.hidden ? 0 : 1;
      const ap = a.dataIndex === "operation" ? 0 : 1;
      const bp = b.dataIndex === "operation" ? 0 : 1;
      return bv - av || bp - ap; // Prioritize visible columns / 优先显示未隐藏的列
    });
  const { i18n } = useLocale();
  const [activeId, setActiveId] = useState<string | null>(null); // State to track the active dragged item / 跟踪当前正在拖动的项目的状态
  const rankedColumns = forwardChecked(columns); // Sort columns initially by hidden state / 初始时根据hidden状态对列进行排序
  const [items, setItems] = useState(rankedColumns); // State to manage columns list after dragging / 用于管理拖动后的列列表

  // Find the active (currently dragged) item
  // 查找当前激活（正在拖动的）项
  const activeItem = items.find((item) => item.id === activeId);

  // ItemProps for reusable draggable item component
  // 可复用的拖动项组件的ItemProps
  type ItemProps = {
    id: string;
    label: string;
    hidden: boolean;
    listeners?: any; // Drag listeners / 拖动事件监听器
    style?: React.CSSProperties; // Item styling (for dragging) / 项目的样式（用于拖动时）
    isDragging?: boolean; // Flag to check if item is being dragged / 是否正在拖动的标志
  };

  // Reusable draggable item component
  // 可复用的拖动项组件
  const Item = forwardRef<HTMLDivElement, ItemProps>(
    ({ id, label, hidden, listeners, style, isDragging }, ref) => (
      <div
        ref={ref}
        style={style}
        className="flex justify-items-stretch bg-white"
      >
        <div className="flex self-stretch items-center">
          {/* Drag handle / 拖动手柄 */}
          <MaterialCommunityIcons
            name="drag-vertical"
            size={18}
            className="text-zinc-500"
            {...listeners}
          />
        </div>
        {isDragging ? (
          <div className="mr-1 p-2 flex-1 border-2 border-dashed border-green-400" />
        ) : (
          <>
            {/* Checkbox to toggle visibility / 切换列可见性的复选框 */}
            <div className="flex p-2 border self-stretch items-center border-zinc-300">
              <Checkbox
                color="#16a34a"
                value={!hidden} // Value is inverted since hidden means it's not visible
                onChange={() => handleCheckboxChange(id)} // Handle checkbox change / 处理复选框变化
              />
            </div>
            {/* Column label / 列标签 */}
            <View className="mr-1 p-1 flex-1 border-y border-r border-zinc-300 justify-center">
              <div>{label}</div>
            </View>
          </>
        )}
      </div>
    )
  );

  // Sortable item component for each column
  // 每个列的可排序项组件
  const SortableItem = ({ id, label, hidden }: ItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id }); // Use the useSortable hook for draggable behavior / 使用useSortable钩子实现拖动行为

    const style = {
      transform: CSS.Transform.toString(transform), // Apply drag transform / 应用拖动变换
      transition,
    };

    return (
      <Item
        id={id}
        label={label}
        hidden={hidden}
        ref={setNodeRef}
        style={style}
        {...attributes}
        listeners={listeners}
        isDragging={isDragging}
      />
    );
  };

  // Handle the start of a drag event
  // 处理拖动事件开始
  const handleDragStart = ({ active }: { active: any }) => {
    setActiveId(active.id); // Set the active id to track the item being dragged / 设置活跃项ID以跟踪正在拖动的项目
  };

  // Handle the end of a drag event
  // 处理拖动事件结束
  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    if (
      active?.id !== undefined &&
      over?.id !== undefined &&
      active.id !== over.id
    ) {
      setItems((prevItems) => {
        // Find the old and new index of the dragged item / 查找拖动项的旧索引和新索引
        const oldIndex = prevItems.findIndex((item) => item.id === active.id);
        const newIndex = prevItems.findIndex((item) => item.id === over.id);

        // Reorder the items and apply sorting based on hidden state / 重新排序项并根据hidden状态应用排序
        return forwardChecked(arrayMove(prevItems, oldIndex, newIndex));
      });
    }
    setActiveId(null); // Reset the active id after drag ends / 拖动结束后重置活跃项ID
  };

  // Handle checkbox changes for visibility toggling
  // 处理复选框变化以切换列的可见性
  const handleCheckboxChange = (id: string | number) => {
    setItems((items) => {
      // Update the hidden state of the clicked item / 更新点击项的hidden状态
      const newItems = items.map((item) =>
        item.id === id ? { ...item, hidden: !item.hidden } : item
      );
      return forwardChecked(newItems); // Re-sort after checkbox change / 复选框变化后重新排序
    });
  };

  // Handle submission of the columns' state
  // 提交列状态的处理函数
  const handleSubmit = () => {
    onSubmit && onSubmit(items); // Submit the sorted items with hidden states / 提交已排序并包含hidden状态的项
  };

  // Handle canceling the column toolbar
  // 取消列工具栏的处理函数
  const handleCancel = () => {
    onCancel && onCancel(); // Trigger cancel callback if defined / 如果定义了取消回调，则触发
  };

  return (
    <BasicFrame
      headerText={i18n.t("Column tool")} // Header text for the frame / 组件的标题文本
      handleSubmit={handleSubmit} // Submit handler / 提交处理函数
      handleCancel={handleCancel} // Cancel handler / 取消处理函数
    >
      <div className="flex flex-col w-full h-full">
        {/* Drag and drop context setup / 拖放上下文设置 */}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart} // Drag start callback / 拖动开始回调
          onDragEnd={handleDragEnd} // Drag end callback / 拖动结束回调
          modifiers={[restrictToVerticalAxis, restrictToParentElement]} // Restrict drag to vertical axis and parent bounds / 限制拖动到垂直轴和父元素范围
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {/* Render sortable items / 渲染可排序项 */}
            <div className="space-y-3 w-full flex-1 overflow-y-auto">
              {items
                .filter(
                  ({ id, label, hidden }) =>
                    id !== undefined &&
                    label !== undefined &&
                    hidden !== undefined
                )
                .map(({ id, label, hidden }) => (
                  <SortableItem
                    key={id}
                    id={id}
                    label={label}
                    hidden={hidden}
                  />
                ))}
            </div>
          </SortableContext>
          {/* Display the active item during drag / 拖动过程中显示激活项 */}
          <DragOverlay>{activeItem && <Item {...activeItem} />}</DragOverlay>
        </DndContext>
      </div>
    </BasicFrame>
  );
}
