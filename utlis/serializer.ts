import { getLength, isJsonObject, isObejctEmpty } from "./commonUtils";
import _ from "lodash";

/**
 * Adds a `.rowSpan` property to each key in the data object except those already ending in `.rowSpan`.
 * The `.rowSpan` value is determined by the provided index and count parameters.
 *
 * @param data - The input data object to which the `.rowSpan` property will be added.
 * @param index - The index of the current item (default is 0).
 * @param count - The total count of items for this group (default is 1).
 * @returns A new object with the added `.rowSpan` properties.
 */
function assignRS(
  data: Record<string, any>,
  index: number = 0,
  count: number = 1
) {
  // Filter out keys that end with `.rowSpan` or have a matching key for `.rowSpan`
  const rowSpanKeys = Object.keys(data).filter(
    (key) => !key.endsWith(".rowSpan") && !data.hasOwnProperty(`${key}.rowSpan`)
  );

  // Use reduce to generate the new rowSpan values
  const rowSpanData = rowSpanKeys.reduce(
    (acc, key) => ({
      ...acc,
      [`${key}.rowSpan`]: index === 0 ? count : 0,
    }),
    {}
  );

  // Return the combined result with the new rowSpan values
  return {
    ...data,
    ...rowSpanData,
  };
}

/**
 * Computes the Cartesian product of two arrays.
 * For each item in arrB, it maps over arrA and combines each item of arrA with arrB,
 * using the `assignRS` function to add a `.rowSpan` property.
 *
 * @param arrA - The first array to be combined.
 * @param arrB - The second array to be combined.
 * @returns The Cartesian product of arrA and arrB, with `.rowSpan` properties added.
 */
function dkr(arrA: any[], arrB: any[]) {
  if (arrA.length === 0) return arrB;
  if (arrB.length === 0) return arrA;

  return arrB.flatMap((b) =>
    arrA.map((a, index) => ({
      ...a,
      ...assignRS(b, index, arrA.length), // Use `assignRS` to combine each item from arrA with arrB
    }))
  );
}

/**
 * Flattens a nested JSON object into a flat list, following specific rules for columns and skipped columns.
 *
 * @param data - The input data to be flattened.
 * @param columns - The list of columns to include in the flattened result.
 * @param skipCols - The list of columns to skip when flattening the data.
 * @returns A flat array representing the nested data, with Cartesian products applied for proper row spans.
 */
function flattenData(data: any, columns: string[], skipCols: string[]) {
  // Helper function to recursively flatten data
  function flatten(data: any, prefix = ""): any {
    // If data is an array, flatten each item recursively
    if (Array.isArray(data)) {
      return data.flatMap((d) => flatten(d, prefix));
    }

    // If data is a primitive value, return the data wrapped in an object
    if (!isJsonObject(data)) {
      // return columns.includes(prefix) ? { [prefix]: data } : {};
      return { [prefix]: data };
    }

    let result: any = []; // Holds the final flattened result
    let unsortedKeys: any = []; // Holds keys for sorting later
    const flatResult: Record<string, any> = {}; // Holds the flattened data

    // If data is an object, iterate over its properties to flatten them
    for (const [k, v] of Object.entries(data)) {
      const newPrefix = prefix ? `${prefix}.${k}` : k; // Create the new key for the flattened object
      unsortedKeys.push(newPrefix); // Add the new key to unsortedKeys

      // If the key is in skipCols, skip flattening this key and add it directly to flatResult
      if (skipCols.includes(newPrefix)) {
        flatResult[newPrefix] = v;
      } else {
        const fd = flatten(v, newPrefix); // Recursively flatten nested values
        flatResult[newPrefix] = isJsonObject(fd) ? [fd] : fd; // If the flattened result is an object, wrap it in an array
      }
    }

    // Cartesian product, flatten one object to multiple objects
    // The order is crucial when determining rowSpan
    const sortedKeys = [
      ...new Set(
        columns
          .map((col) => {
            // Find a matching key in unsortedKeys for each column
            const match = unsortedKeys.find(
              (key: string) =>
                col.match(new RegExp(`^${key}\\.`, "g")) || col === key
            );
            if (match) {
              return match; // Return the matched key
            }
            return false;
          })
          .filter(Boolean) // Remove any falsy values from the list of sorted keys
      ),
    ];

    // Create the final key order for flattening
    const keyToFlatten = [
      ...sortedKeys,
      ...unsortedKeys.filter((k: string) => !sortedKeys.includes(k)),
    ];

    // Reverse the key order to apply the Cartesian product correctly
    keyToFlatten.reverse().forEach((fk) => {
      result = dkr(result, flatResult[fk]); // Apply the Cartesian product to the current result
    });

    return result; // Return the flattened result
  }

  // PATCH: To Assign Rowspan to undefined columns
  function postProcess(data: any) {
    // Create a shallow copy of the data to avoid direct mutation
    let processedData = { ...data };

    // Get columns without .rowSpan suffix and determine invalid columns
    const cols = Object.keys(data).filter((col) => !col.endsWith(".rowSpan"));
    const invalidCols = cols
      .filter((col) => !columns.includes(col))
      .flatMap((col) => [col, `${col}.rowSpan`]);

    // Identify columns where the corresponding .rowSpan value needs to be added
    const nullCols = columns.filter((col) => !cols.includes(col));

    // Map over nullCols and add the corresponding rowSpan to processedData
    nullCols.forEach((col) => {
      const match = cols.find((tc) => col.startsWith(tc));
      if (match) {
        const matchRowSpan = data[`${match}.rowSpan`];
        if (matchRowSpan !== undefined) {
          processedData[`${col}.rowSpan`] = matchRowSpan;
        }
      }
    });

    // Return the processedData after omitting invalid columns
    return _.omit(processedData, invalidCols);
  }

  const flattenData = flatten(data);
  const processedData = flattenData.map((data: any) => postProcess(data));

  return processedData; // Start the flattening process
}

/**
 * Flattens a nested tree structure into header metadata and split keys for further processing.
 *
 * @param data - The nested input data structure.
 * @returns An object containing the flattened headers and splits.
 */
function flattenHeaderMeta(columns: Record<string, any>) {
  // Array to store header metadata
  const headers: Array<Record<string, any>> = [];
  // Array to store split keys
  const splits: string[] = [];

  /**
   * Recursively traverses the tree structure to extract headers and splits.
   *
   * @param node - The current node in the tree.
   * @param prefix - The prefix representing the current key path.
   */
  function traverseTree(node: Record<string, any>, prefix = "") {
    Object.entries(node).forEach(([key, value]) => {
      const currentPrefix = prefix ? `${prefix}.${key}` : key;
      const { label, child, children, ...rest } = value;

      if (children) {
        // Recursively process children
        traverseTree(children, currentPrefix);
      } else if (child) {
        // Add the current key to splits and process its children
        splits.push(currentPrefix);
        traverseTree(child.children, currentPrefix);
      } else if (label) {
        // Add a new header entry
        headers.push({
          title: label,
          dataIndex: currentPrefix,
          ...rest, // Include other properties dynamically
        });
      }
    });
  }

  // Start traversing from the root node
  traverseTree(columns);

  // Return the processed headers and splits
  return { headers, splits };
}

/**
 * Converts a flat data structure back into a nested structure based on column definitions.
 *
 * @param data - The flattened data object where keys represent nested paths (e.g., "a.b.c").
 * @param columns - The structure definition for the nested data.
 * @returns The nested data object reconstructed from the flattened data.
 */
function unFlattenData(
  data: Record<string, any>,
  columns: Record<string, any>
): Record<string, any> {
  /**
   * Recursively reconstructs the nested structure.
   *
   * @param node - The current node of the column definitions.
   * @param prefix - The prefix representing the current path in the flattened data.
   * @returns The reconstructed nested data for the given node.
   */
  function traverseTree(
    node: Record<string, any>,
    prefix = ""
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(node)) {
      const currentPrefix = prefix ? `${prefix}.${key}` : key;
      const { type, children, child } = value;

      // Recursively handle nested structures
      const nestedColumns = children || (child && child.children);
      if (nestedColumns) {
        const nestedResult = traverseTree(nestedColumns, currentPrefix);
        if (getLength(nestedResult) > 0) {
          const processedNestedRes = isObejctEmpty(nestedResult)
            ? null
            : nestedResult;
          if (processedNestedRes !== null) {
            result[key] = children ? processedNestedRes : [nestedResult];
          } else {
            result[key] = children ? processedNestedRes : [];
          }
        }
      }
      // Add leaf node values
      else if (
        !["nested object", "field"].includes(type) &&
        data[currentPrefix] !== undefined
      ) {
        result[key] = data[currentPrefix];
      }
    }

    return result;
  }

  // Start traversal from the root columns
  return traverseTree(columns);
}

/**
 * Merges two datasets (`da` and `db`) based on the provided column structure.
 *
 * @param da - The first dataset (e.g., the original data).
 * @param db - The second dataset (e.g., the updated data).
 * @param columns - A record describing the structure of the data, including nested children.
 * @returns A merged result object that combines data from `da` and `db` based on the column structure.
 */
function mergeData(da: any, db: any, columns: Record<string, any>) {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(columns)) {
    const { type, children, child } = value;

    // Handle merging for nested objects (structured as `children`)
    if (children) {
      // Recursively merge nested objects for `children`
      result[key] = mergeData(da?.[key] ?? {}, db?.[key] ?? {}, children); // Default to an empty object if `da` or `db` is undefined
    }
    // Handle merging for arrays of child objects (structured as `child.children`)
    else if (child && child.children) {
      const mergedArray: any[] = [];

      // Safely access `da[key]` and `db[key]`, default to empty arrays if undefined or null
      const daArray = Array.isArray(da?.[key]) ? da[key] : [];
      const dbArray = Array.isArray(db?.[key]) ? db[key] : [];

      // Merge the arrays based on matching `pk`
      for (const b of dbArray) {
        // Ensure `b` is an object with a `pk` property
        if (b && b.pk) {
          const matchingDaObject = daArray.find(
            (item: any) => item?.pk === b.pk
          );

          if (matchingDaObject) {
            // Recursively merge matching objects
            const mergedData = mergeData(matchingDaObject, b, child.children);
            mergedArray.push(mergedData);
          } else {
            // If no match, keep the original object from `db`
            mergedArray.push(b);
          }
        } else {
          // Handle case where `b` is not an object with a `pk`
          mergedArray.push(b);
        }
      }

      // Add remaining objects from `da` that are not present in `db`
      for (const a of daArray) {
        if (!mergedArray.some((merged: any) => merged.pk === a.pk)) {
          mergedArray.push(a);
        }
      }

      result[key] = mergedArray;
    }
    // Handle properties with a `label` (simple key-value pairs)
    else if (!["nested object", "field"].includes(type)) {
      // Prefer the value from `da` if defined; otherwise, use the value from `db`
      result[key] = da?.[key] !== undefined ? da[key] : db?.[key];
    }
    // Handle all other properties
    else {
      // Prefer the value from `db` if defined; otherwise, use the value from `da`
      result[key] = db?.[key] !== undefined ? db[key] : da?.[key];
    }
  }

  return result;
}

/**
 * Traverses a hierarchical data structure and collects key-value pairs for rows where `rowSpan` equals 1.
 *
 * @param data - The dataset containing hierarchical data and metadata.
 * @param columns - The column structure defining the hierarchy of the data.
 * @returns An array of key-value pairs, where keys are the "pk" paths and values are their corresponding data.
 */
function deleteLevel(data: any, columns: Record<string, any>) {
  const result: any[] = []; // Store the result as an array of key-value pairs.

  /**
   * Recursive function to traverse the tree structure and process nodes.
   *
   * @param node - The current node in the `columns` hierarchy.
   * @param prefix - The prefix for constructing the hierarchical key (e.g., "parent.child.pk").
   */
  function traverseTree(node: Record<string, any>, prefix = "") {
    // Construct the full path for the "pk" field at the current level.
    const pk = `${prefix ? `${prefix}.` : ""}pk`;

    // Check if the current `pk` has a `rowSpan` of 1.
    if (data[`${pk}.rowSpan`] === 1) {
      // If true, push the "pk" path and its value into the result array.
      result.push([pk, data[pk]]);
      return; // Stop further traversal for this branch.
    }

    // Iterate over the current node's keys and values.
    for (const [key, value] of Object.entries(node)) {
      // Construct the full path for the current key.
      const currentPrefix = `${prefix ? `${prefix}.` : ""}${key}`;

      // Destructure `children` and `child` properties for clarity.
      const { children, child } = value;

      // If the node has `children` or `child.children`, recursively traverse them.
      if (children || (child && child.children)) {
        traverseTree(children || child.children, currentPrefix);
      }
    }
  }

  // Start traversing from the root of the `columns` structure.
  traverseTree(columns);

  // Return the collected key-value pairs.
  return result;
}

export {
  flattenData,
  flattenHeaderMeta,
  unFlattenData,
  mergeData,
  deleteLevel,
};
