import { useState } from "react";
import { DataService } from "@/services/DataService";
import { AuthError } from "@/services/AuthService";
import { FetchError } from "@/utlis/webHelper";
import { useLocale } from "@/context/Locale";

// API Response structure for general API calls
interface ApiResponse {
  status: boolean;
  data?: any;
  error?: any;
}

// Error state structure to handle different error cases
interface ErrorState {
  message: string;
  status?: string | number;
}

// Success state structure for tracking successful operations
interface SuccState {
  message: string;
}

export default function useDataService() {
  const { locale, i18n } = useLocale(); // Get the current locale from context
  const [loading, setLoading] = useState(false); // Loading state for tracking request progress
  const [error, setError] = useState<ErrorState | null>(null); // Error state to store error details
  const [success, setSuccess] = useState<SuccState | null>(null); // Success state for tracking success messages
  const commonHeader = { "Accept-Language": locale }; // Default headers for API calls

  // Handles making an API call and managing loading, success, and error states
  const handleApiCall = async (
    apiCall: () => Promise<any>,
    successMessage?: string
  ): Promise<ApiResponse> => {
    setLoading(true);
    clearStates(); // Clear previous states

    try {
      const data = await apiCall(); // Perform the actual API call
      if (successMessage) {
        setSuccess({ message: successMessage });
      }
      return { status: true, data }; // Return successful response
    } catch (err) {
      const errorState = handleError(err); // Handle errors
      setError(errorState); // Set the error state
      return { status: false, error: errorState };
    } finally {
      setLoading(false); // Reset loading state after API call finishes
    }
  };

  // Utility to clear error and success states
  const clearStates = () => {
    setError(null);
    setSuccess(null);
  };

  // Handles different types of errors and returns a structured error state
  const handleError = (err: any): ErrorState => {
    if (err instanceof FetchError) {
      return {
        message: err.message,
        status: err.status,
      };
    } else if (err instanceof AuthError) {
      return {
        message: err.message,
        status: "auth-error",
      };
    } else {
      return {
        message:
          err instanceof Error
            ? err.message
            : i18n.t("An unknown error occurred"),
        status: "unknown-error",
      };
    }
  };

  // Utility functions to clear error or success state
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  // Helper function to merge headers
  const mergeHeaders = (headers?: { [key: string]: string }) => ({
    ...commonHeader,
    ...headers,
  });

  // API call for creating a new resource
  const create = async (
    contentType: string,
    data: object,
    headers?: { [key: string]: string }
  ): Promise<ApiResponse> => {
    return handleApiCall(
      () => DataService.createView(contentType, data, mergeHeaders(headers)),
      "Create successfully"
    );
  };

  // API call for updating an existing resource
  const update = async (
    id: any,
    contentType: string,
    data: object,
    headers?: { [key: string]: string }
  ): Promise<ApiResponse> => {
    return handleApiCall(
      () =>
        DataService.updateView(id, contentType, data, mergeHeaders(headers)),
      "Update successfully"
    );
  };

  // API call to fetch a list of resources
  const list = async (
    contentType: string,
    params?: { [key: string]: any },
    headers?: { [key: string]: string }
  ): Promise<ApiResponse> => {
    return handleApiCall(() =>
      DataService.listView(contentType, params, mergeHeaders(headers))
    );
  };

  // API call to delete a resource
  const deleteItem = async (
    id: any,
    contentType: string,
    headers?: { [key: string]: string }
  ): Promise<ApiResponse> => {
    return handleApiCall(
      () => DataService.deleteView(id, contentType, mergeHeaders(headers)),
      "Delete successfully"
    );
  };

  // API call to fetch options for a given resource type
  const options = async (
    contentType: string,
    headers?: { [key: string]: string }
  ): Promise<ApiResponse> => {
    return handleApiCall(() =>
      DataService.optionView(contentType, mergeHeaders(headers))
    );
  };

  // Generic Request, this is a wrapper for DataService.genericRequest
  const request = async (
    uri: string,
    method: "POST" | "GET" | "DELETE" | "PUT" | "PATCH" | "OPTIONS" | undefined,
    data?: object,
    params?: { [key: string]: string },
    headers?: { [key: string]: string }
  ): Promise<ApiResponse> => {
    return handleApiCall(() =>
      DataService.genericRequest(
        uri,
        method,
        data,
        params,
        mergeHeaders(headers)
      )
    );
  };

  // Return the functions and state management hooks to the component
  return {
    create,
    list,
    deleteItem,
    update,
    options,
    request,
    loading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}
