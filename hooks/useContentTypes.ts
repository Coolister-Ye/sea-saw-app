import { useState, useEffect } from "react";
import useDataService from "./useDataService";

interface ContentTypeCache {
  order?: number;
  purchaseorder?: number;
  [key: string]: number | undefined;
}

let cachedContentTypes: ContentTypeCache = {};

/**
 * Hook to get ContentType IDs for different models.
 * Results are cached to avoid repeated API calls.
 */
export default function useContentTypes() {
  const [contentTypes, setContentTypes] = useState<ContentTypeCache>(cachedContentTypes);
  const [loading, setLoading] = useState(false);
  const { apiClient } = useDataService();

  useEffect(() => {
    // If already cached, don't fetch again
    if (Object.keys(cachedContentTypes).length > 0) {
      return;
    }

    const fetchContentTypes = async () => {
      setLoading(true);
      try {
        // Fetch content types from Django's contenttypes API
        // You may need to create a custom endpoint for this
        const response = await apiClient.get("/api/content-types/");

        const types: ContentTypeCache = {};
        response.data.forEach((ct: any) => {
          // Store by model name (lowercase)
          types[ct.model.toLowerCase()] = ct.id;
        });

        cachedContentTypes = types;
        setContentTypes(types);
      } catch (error) {
        console.error("Failed to fetch content types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentTypes();
  }, [apiClient]);

  return {
    contentTypes,
    loading,
    getContentTypeId: (modelName: string) => contentTypes[modelName.toLowerCase()],
  };
}
