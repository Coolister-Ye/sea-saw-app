import { Table } from "@/components/table/AntdTable";
import useDataService from "@/hooks/useDataService";
import React from "react";

export default function ContractScreen() {
  const { list } = useDataService();

  /**
   * Helper function to format contact data into selectable options
   * @param contacts - Array of contact objects
   * @returns Array of formatted contact options
   */
  const formatContactOptions = (contacts: any[]) =>
    contacts
      .map(({ first_name = "", last_name = "" }) =>
        `${first_name} ${last_name}`.trim()
      ) // Concatenate first and last names, trimming whitespace
      .filter(Boolean) // Remove empty or falsy names
      .map((fullName: string) => ({ value: fullName, label: fullName })); // Transform to {value, label} structure

  /**
   * Fetch contact options for the lookup field based on the search query
   * @param search - Search query string
   * @returns Array of formatted contact options
   */
  const searchContact = async (search: string) => {
    try {
      const { data } = await list("contact", { search, page_size: 5 });
      return formatContactOptions(data.results); // Format the API results into selectable options
    } catch (error) {
      console.error("Error loading lookup data: ", error);
      return []; // Return empty array on error
    }
  };

  // Column configuration for the table
  const colConfig = {
    pk: {
      width: 50, // Set column width
    },
    owner: { hidden: true }, // Hide the owner column
    created_at: { hidden: true }, // Hide the created_at column
    updated_at: { hidden: true }, // Hide the updated_at column
    "orders.pk": { hidden: true }, // Hide nested order ID column
    "orders.products.pk": { hidden: true }, // Hide nested product ID column
    "contact.full_name": {
      variant: "lookup", // Define column as a lookup type
      getOptions: searchContact, // Provide async option loader
    },
    "orders.deposit": {
      variant: "currency", // Format as currency
    },
    "orders.balance": {
      variant: "currency", // Format as currency
    },
    "orders.products.glazing": {
      variant: "percentage", // Format as percentage
    },
    "orders.products.price": {
      variant: "currency", // Format as currency
    },
    "orders.products.total_price": {
      variant: "currency", // Format as currency
    },
  };

  return (
    <Table
      table="contract" // Table identifier
      fixedCols={{
        right: ["orders.products.progress_quantity"], // Fix the progress column on the right
        left: ["contract_code"], // Fix the contract code column on the left
      }}
      colConfig={colConfig} // Pass column configuration
    />
  );
}
