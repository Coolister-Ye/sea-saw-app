export type TableConfigType = {
  table: string;
  tableRef: any;
  defaultColWidth?: number;
  fixedCols?: Partial<Record<"left" | "right", string[]>>;
  colConfig?: Record<string, any>;
  actionConfig?: Record<string, any>;
  ordering?: string;
};

export type PaginationProps = {
  page: number;
  page_size: number;
};

export type TableState = {
  paginationModel: PaginationProps;
  columns: any[];
  data: any[];
  flatData: any[];
  dataCount: number;
  editingKey: string;
};

export type TableAction =
  | { type: "SET_PAGINATION_MODEL"; payload: PaginationProps }
  | { type: "SET_COLUMNS"; payload: any[] }
  | { type: "SET_DATA"; payload: any[] }
  | { type: "SET_FLAT_DATA"; payload: any[] }
  | { type: "SET_DATA_COUNT"; payload: number }
  | { type: "SET_EDITING_KEY"; payload: string };

export const initialTableState: TableState = {
  paginationModel: { page: 1, page_size: 50 },
  columns: [],
  data: [],
  flatData: [],
  dataCount: 0,
  editingKey: "",
};

export function tableReducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "SET_PAGINATION_MODEL":
      return { ...state, paginationModel: action.payload };
    case "SET_COLUMNS":
      return { ...state, columns: action.payload };
    case "SET_DATA":
      return { ...state, data: action.payload };
    case "SET_FLAT_DATA":
      return { ...state, flatData: action.payload };
    case "SET_DATA_COUNT":
      return { ...state, dataCount: action.payload };
    case "SET_EDITING_KEY":
      return { ...state, editingKey: action.payload };
    default:
      return state;
  }
}
