// import { Table } from "@/components/sea/table/AntdTable";
import { Table } from "@/components/table/AntdTable";
import useDataService from "@/hooks/useDataService";
import React from "react";

export default function ContactScreen() {
  const { list } = useDataService();

  const formatCompanyOptions = (contacts: any[]) =>
    contacts.map(({ company_name }) => ({
      value: company_name,
      label: company_name,
    }));

  const searchCompany = async (search: string) => {
    try {
      const { data } = await list("company", { search, page_size: 5 });
      return formatCompanyOptions(data.results);
    } catch (error) {
      console.error("Error loading lookup data: ", error);
      return [];
    }
  };

  const colConfig = {
    pk: { width: 50 },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    created_by: { hidden: true },
    updated_by: { hidden: true },
    "company.company_name": {
      variant: "lookup",
      getOptions: searchCompany,
    },
  };

  return <Table table="contact" colConfig={colConfig} />;
}
