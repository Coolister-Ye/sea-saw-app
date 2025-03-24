import { Select as AntdSelect, SelectProps as AntdSelectProps } from "antd";

type SelectProps = {} & AntdSelectProps;

const Select = (props: SelectProps) => {
  return <AntdSelect {...props} />;
};

export default Select;
