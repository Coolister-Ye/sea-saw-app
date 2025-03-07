/**
 * Splits a string by underscores ("_"), converts each segment to uppercase,
 * and joins them with spaces.
 *
 * @param str - The input string to be split and transformed.
 * @returns The transformed string with each word in uppercase and separated by spaces.
 */
export function splitAndUpperCaseString(str: string): string {
  if (!str) return str;
  return str
    .split("_")
    .map((s) => s.toUpperCase())
    .join(" ");
}

/**
 * Capitalizes the first letter of a string, leaving the rest unchanged.
 *
 * @param str - The string to capitalize.
 * @returns The string with the first letter capitalized.
 */
export function capitalizeString(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a singular word to its plural form based on common English pluralization rules.
 *
 * @param str - The singular word to pluralize.
 * @returns The plural form of the word.
 */
export function changeToPlural(str: string): string {
  if (!str) return str;

  // If word already ends with 's', 'es', or 'ies', assume it is plural
  if (/s$|es$|ies$/i.test(str)) {
    return str;
  }

  // If word ends with s, x, z, ch, or sh, add "es"
  if (/(s|x|z|ch|sh)$/i.test(str)) {
    return str + "es";
  }

  // If word ends with a consonant followed by y, replace y with "ies"
  if (/[^aeiou]y$/i.test(str)) {
    return str.slice(0, -1) + "ies";
  }

  // Default case: add "s"
  return str + "s";
}

/**
 * Converts a plural word to its singular form based on common English rules.
 *
 * @param word - The plural word to convert.
 * @returns The singular form of the word.
 */
export function toSingular(word: string): string {
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }
  if (word.endsWith("es") && !word.endsWith("oes") && !word.endsWith("ses")) {
    return word.slice(0, -2);
  }
  if (word.endsWith("s")) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Converts a string into camelCase.
 *
 * @param str - The string to convert.
 * @returns The camelCase version of the string.
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => (index === 0 ? word : capitalizeString(word)))
    .join("");
}

/**
 * Determines if a value is a plain JSON object (i.e. not null and not an array).
 *
 * @param obj - The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isJsonObject(obj: any): obj is Record<string, any> {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

/**
 * Returns the length of a JSON-like structure.
 *
 * @param json - The input data (array or object).
 * @returns The length of the array or number of keys in the object, or 0 for other types.
 */
export function getLength(json: any): number {
  if (!json || typeof json !== "object") return 0;
  return Array.isArray(json) ? json.length : Object.keys(json).length;
}

/**
 * Checks if all values in a JSON object are null.
 *
 * @param json - The JSON object to check.
 * @returns True if all values are null; otherwise, false.
 */
export function isObjectEmpty(json: Record<string, any>): boolean {
  return Object.values(json).every((value) => value === null);
}

/**
 * Checks if all values in a JSON object (excluding "pk" and "id") are either null or empty strings.
 *
 * @param json - The JSON object to check.
 * @returns True if all applicable values are null or empty; otherwise, false.
 */
export function isJsonEmpty(json: Record<string, any>): boolean {
  return Object.entries(json)
    .filter(([key]) => key !== "pk" && key !== "id")
    .every(
      ([_, value]) =>
        value === null || (typeof value === "string" && value.trim() === "")
    );
}

/**
 * Converts a JSON object to a formatted string representation.
 *
 * @param json - The JSON object to convert.
 * @returns A string representing the JSON object.
 * @throws Will throw an error if the input is not a plain object.
 */
export function json2Str(json: any): string {
  if (Array.isArray(json)) {
    return `[${json.toString()}]`;
  }
  if (!isJsonObject(json)) {
    throw new Error("Input must be a JSON object");
  }
  return Object.entries(json)
    .map(([key, value]) => {
      if (isJsonObject(value)) {
        value = json2Str(value);
      } else if (Array.isArray(value)) {
        value = `[${value.toString()}]`;
      } else if (typeof value === "string") {
        value = `"${value}"`;
      }
      return `${key}: ${value}`;
    })
    .join(", ");
}

const formatCurrency = (value: any, decimals = 2) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "symbol",
    maximumFractionDigits: decimals,
  }).format(value);
};

function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) {
    return "NaN";
  }
  return `${(value * 100).toFixed(decimals)}%`;
}
