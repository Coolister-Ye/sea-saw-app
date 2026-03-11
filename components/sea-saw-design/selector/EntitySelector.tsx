import React, { forwardRef } from "react";
import { View } from "react-native";

import { SelectorTrigger } from "@/components/sea-saw-design/selector/SelectorTrigger";

import type { EntityItem, EntitySelectorProps } from "./types";
import { useEntitySelector } from "./useEntitySelector";
import { EntitySelectorModal } from "./EntitySelectorModal";

export type { EntityItem, EntitySelectorProps };

const EntitySelectorInner = <T extends EntityItem>(
  props: EntitySelectorProps<T>,
  ref: React.Ref<View>,
) => {
  const { renderSelectedChip, multiple = false } = props;

  const selector = useEntitySelector<T>(props);

  const {
    isOpen,
    setIsOpen,
    selected,
    loading,
    searchText,
    handleSearch,
    options,
    columnDefs,
    onGridReady,
    handleRowClicked,
    getRowClass,
    handleClear,
    handleConfirm,
    handleRemove,
    defaultRenderChip,
    closeModal,
    modalTitle,
    placeholderText,
    readOnly,
  } = selector;

  return (
    <View className="w-full" ref={ref}>
      <SelectorTrigger
        disabled={readOnly}
        onPress={() => setIsOpen(true)}
        placeholder={placeholderText}
        hasSelection={selected.length > 0}
        renderSelected={() =>
          selected.map((item: T) => (
            <React.Fragment key={item.id}>
              {renderSelectedChip
                ? renderSelectedChip(item, () => handleRemove(item.id))
                : defaultRenderChip(item, () => handleRemove(item.id))}
            </React.Fragment>
          ))
        }
      />

      {!readOnly && (
        <EntitySelectorModal
          isOpen={isOpen}
          closeModal={closeModal}
          modalTitle={modalTitle}
          searchText={searchText}
          onSearchChange={handleSearch}
          options={options}
          columnDefs={columnDefs}
          onGridReady={onGridReady}
          onRowClicked={handleRowClicked}
          getRowClass={getRowClass}
          loading={loading}
          multiple={multiple}
          selected={selected}
          displayField={props.displayField}
          onClear={handleClear}
          onConfirm={handleConfirm}
        />
      )}
    </View>
  );
};

const EntitySelector = forwardRef(EntitySelectorInner) as <
  T extends EntityItem,
>(
  props: EntitySelectorProps<T> & { ref?: React.Ref<View> },
) => ReturnType<typeof EntitySelectorInner>;

export default EntitySelector;
export { EntitySelector };
