import { Table } from "@/components/table/AntdTable";
import { formatOptions } from "@/components/table/LookupOption";
import useDataService from "@/hooks/useDataService";
import React from "react";

export default function ContactScreen() {
  const { list } = useDataService();

  /**
   * Fetches company options for the lookup field based on search input.
   * @param search - The search string input by the user.
   * @returns A formatted list of options or an empty array if an error occurs.
   */
  const searchCompany = async (search: string) => {
    try {
      const { data } = await list({
        contentType: "company",
        params: { search, page_size: 5 },
      });
      return formatOptions(data.results, "company_name");
    } catch (error) {
      console.error("Error loading lookup data:", error);
      return [];
    }
  };

  // Column configuration for the table
  const colConfig = {
    pk: { width: 30 },
    email: { width: 200 },
    owner: { hidden: true },
    created_at: { hidden: true },
    updated_at: { hidden: true },
    created_by: { hidden: true },
    updated_by: { hidden: true },
    "company.pk": { hidden: true, width: 30 },
    "company.company_name": {
      variant: "lookup",
      getOptions: searchCompany,
    },
  };

  // Formula for computed fields in edit mode
  const formula = {
    full_name: ({
      first_name,
      last_name,
    }: {
      first_name?: string;
      last_name?: string;
    }) => [first_name, last_name].filter(Boolean).join(" ").trim(),
  };

  return (
    <Table
      table="contact"
      colConfig={colConfig}
      formula={formula}
      defaultColWidth={150}
    />
  );
}
