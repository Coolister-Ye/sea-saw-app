import { splitAndUpperCaseString } from "./commonUtils";
import { validator } from "./validator";
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';
import {
  GridColDef,
  GridRowsProp,
  DataGrid,
  GridPreProcessEditCellProps,
  GridEditInputCell,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

function NameEditInputCell(props: GridRenderEditCellParams) {
  const { error } = props;

  return (
    <StyledTooltip open={!!error} title={error}>
      <GridEditInputCell {...props} />
    </StyledTooltip>
  );
}

function renderEditName(params: GridRenderEditCellParams) {
  return <NameEditInputCell {...params} />;
}

export function fieldConverter(
  fields: {
    id: number;
    field_name: string;
    field_type: string;
    field_tag: any;
    owner: string;
    is_active: boolean;
    is_mandatory: boolean;
    content_type: string;
    extra_info: any;
    created_by: string;
  }[],
  isEditable: boolean = true
) {
  let type = "string";
  switch (type) {
    case "text":
      type = "string";
      break;
    case "numerical":
      type = "number";
      break;
    case "picklist":
      type = "singleSelect";
      break;
    case "lookup":
      type = "string";
      break;
    case "date":
      type = "date";
      break;
    case "currency":
      type = "number";
      break;
    case "email":
      type = "string";
      break;
    case "phone":
      type = "string";
      break;
    case "url":
      type = "string";
      break;
    default:
      type = "string";
  }

  const preProcessValidator = validator(fields);
  const columns = fields.map((field) => {
    const picklist = field.extra_info?.picklist;
    return {
      field: field.field_name,
      headerName: splitAndUpperCaseString(field.field_name),
      type: type,
      valueOptions: picklist,
      editable: isEditable,
      // renderEditCell: renderEditName,
      // preProcessValidator: async (params: any) => {
      //   try {
      //     console.log("here");
      //     await preProcessValidator.validateAt(field.field_name, { [field.field_name] : params.props.value});
      //     return {...params.props, error: false};
      //   } catch (error) {
      //     if (error instanceof Error) {
      //       return {...params.props, error: error.message};
      //     }
      //     return {...params.props, error: "unknow error"};
      //   }
      // }
    };
  });

  return columns;
}
