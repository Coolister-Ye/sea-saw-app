export type GridRowSelectionContext = {
  isRowSelected: (key: string) => boolean;
  toggleRow: (key: string) => void;
  toggleAll: (keys: string[]) => void;
  allKeys: string[];
};
