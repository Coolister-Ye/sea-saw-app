/**
 * Splits a string by underscores ("_"), converts each word to uppercase,
 * and joins them back with spaces.
 *
 * @param str - The input string to be split and transformed.
 * @returns The transformed string with each word in uppercase and separated by spaces.
 */
function splitAndUpperCaseString(str: string) {
  if (!str) return str; // If the string is empty or falsy, return the original value
  return str
    .split("_") // Split the string by underscores
    .map((s: string) => s.toUpperCase()) // Convert each word to uppercase
    .join(" "); // Join the words with a space
}

/**
 * Capitalizes the first letter of a string and leaves the rest of the string unchanged.
 *
 * @param str - The string to capitalize.
 * @returns The string with the first letter capitalized and the rest unchanged.
 */
function capitalizeString(str: string) {
  if (!str) return str; // If the string is empty, return the original value
  return str.charAt(0).toUpperCase() + str.slice(1); // Capitalize the first letter and concatenate the rest
}

/**
 * Converts a singular word to its plural form based on common English pluralization rules.
 *
 * @param str - The singular word to be pluralized.
 * @returns The plural form of the word.
 */
function changeToPlural(str: string): string {
  if (!str) return str; // If the string is empty, return the original value

  // Check if the word is already in plural form
  if (/s$|es$|ies$/i.test(str)) {
    return str; // If it's already plural, return the original value
  }

  // If the word ends with s, x, z, ch, or sh, usually add "es" to make it plural
  if (/s$|x$|z$|ch$|sh$/i.test(str)) {
    return str + "es";
  }

  // If the word ends with a consonant followed by y, replace y with "ies"
  if (/[^aeiou]y$/i.test(str)) {
    return str.slice(0, -1) + "ies";
  }

  // In other cases, simply add "s" to make it plural
  return str + "s";
}

/**
 * Converts a plural word to its singular form based on common English rules.
 *
 * @param word - The plural word to be converted to singular.
 * @returns The singular form of the word.
 */
function toSingular(word: string): string {
  // If the word ends with "ies", convert it to "y"
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }

  // If the word ends with "es" and isn't a special case like "oes" or "ses", remove the "es"
  if (word.endsWith("es") && !word.endsWith("oes") && !word.endsWith("ses")) {
    return word.slice(0, -2);
  }

  // If the word ends with "s", remove the "s"
  if (word.endsWith("s")) {
    return word.slice(0, -1);
  }

  // If the word is already singular, return it unchanged
  return word;
}

/**
 * Converts a string into camelCase by converting all characters to lowercase and capitalizing
 * the first letter of each word after the first.
 *
 * @param str - The string to be converted into camelCase.
 * @returns The camelCase version of the string.
 */
function toCamelCase(str: string): string {
  return str
    .toLowerCase() // Convert the entire string to lowercase
    .split(" ") // Split the string by spaces into an array of words
    .map((word, index) => {
      if (index === 0) {
        // The first word remains lowercase
        return word;
      }
      // For all subsequent words, capitalize the first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(""); // Join the words back together to form a camelCase string
}

/**
 * Determines if a given value is a plain JSON object.
 *
 * A plain JSON object is an object that is not null and not an array.
 * This function checks whether the value is of type "object", is not null,
 * and is not an array.
 *
 * @param obj - The value to check.
 * @returns `true` if the value is a plain object, otherwise `false`.
 */
function isJsonObject(obj: any): obj is { [key: string]: any } {
  // Check if obj is of type 'object', is not null, and is not an array
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

/**
 * Returns the length of a JSON-like structure.
 * - For arrays, it returns the number of elements.
 * - For objects, it returns the number of keys.
 * - For other types, it returns 0.
 *
 * @param json - The input data, which can be an array, object, or other types.
 * @returns The length of the array or the number of keys in the object, or 0 for other types.
 */
function getLength(json: any): number {
  if (!json || typeof json !== "object") return 0; // Return 0 for null, undefined, or non-object types
  return Array.isArray(json) ? json.length : Object.keys(json).length; // Handle arrays and objects
}

/**
 * Check if all value in a JSON object are `null`
 */
function isObejctEmpty(json: Record<string, any>): boolean {
  for (const [k, v] of Object.entries(json)) {
    if (v !== null) return false;
  }
  return true;
}

/**
 * Checks if all values in a JSON object are either `null` or empty strings.
 *
 * @param json - The JSON object to check.
 * @returns `true` if all values are empty; otherwise, `false`.
 */
function isJsonEmpty(json: Record<string, any>): boolean {
  return Object.entries(json)
    .filter(([key]) => key !== "pk" && key !== "id") // Exclude "pk" and "id" keys
    .every(
      ([, value]) =>
        value === null || (typeof value === "string" && value.trim() === "")
    );
}

/**
 * Convert a JSON object to a string representation.
 *
 * This function takes a JSON object and converts it to a string format
 * where each key-value pair is represented as `key: value`. Nested objects
 * and arrays are recursively handled to provide a clear string representation.
 *
 * @param json - The JSON object to convert.
 * @returns A string representing the JSON object, with proper formatting.
 * @throws Will throw an error if the input is not an object.
 */
function json2Str(json: any): string {
  // 验证输入是否是一个对象
  if (Array.isArray(json)) {
    return json.toString();
  }

  // 转换每个键值对
  return Object.entries(json)
    .map(([key, value]) => {
      // 对于数组或对象，递归调用 json2Str 格式化
      if (isJsonObject(value)) {
        value = json2Str(value); // 递归调用
      } else if (typeof value === "string") {
        // 对字符串值进行适当的转义
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
    maximumFractionDigits: decimals
  }).format(value);
};

function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value)) {
    return "NaN";
  }

  // 将数字乘以100并转换为带指定小数位数的百分比格式
  return `${(value * 100).toFixed(decimals)}%`;
}

export {
  splitAndUpperCaseString,
  capitalizeString,
  changeToPlural,
  toSingular,
  toCamelCase,
  isJsonObject,
  getLength,
  isJsonEmpty,
  json2Str,
  formatCurrency,
  formatPercentage,
  isObejctEmpty,
};
