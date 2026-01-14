/**
 * String manipulation utilities
 */

/**
 * Splits a string by underscores ("_"), converts each word to uppercase,
 * and joins them back with spaces.
 * @param str - The input string to be split and transformed
 * @returns The transformed string with each word in uppercase and separated by spaces
 */
export function splitAndUpperCaseString(str: string): string {
  if (!str) return str;
  return str
    .split("_")
    .map((s: string) => s.toUpperCase())
    .join(" ");
}

/**
 * Capitalizes the first letter of a string and leaves the rest unchanged.
 * @param str - The string to capitalize
 * @returns The string with the first letter capitalized
 */
export function capitalizeString(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a singular word to its plural form based on common English pluralization rules.
 * @param str - The singular word to be pluralized
 * @returns The plural form of the word
 */
export function changeToPlural(str: string): string {
  if (!str) return str;

  // Check if the word is already in plural form
  if (/s$|es$|ies$/i.test(str)) {
    return str;
  }

  // If the word ends with s, x, z, ch, or sh, add "es"
  if (/s$|x$|z$|ch$|sh$/i.test(str)) {
    return str + "es";
  }

  // If the word ends with a consonant followed by y, replace y with "ies"
  if (/[^aeiou]y$/i.test(str)) {
    return str.slice(0, -1) + "ies";
  }

  // Otherwise, simply add "s"
  return str + "s";
}

/**
 * Converts a plural word to its singular form based on common English rules.
 * @param word - The plural word to be converted to singular
 * @returns The singular form of the word
 */
export function toSingular(word: string): string {
  // If the word ends with "ies", convert it to "y"
  if (word.endsWith("ies")) {
    return word.slice(0, -3) + "y";
  }

  // If the word ends with "es" and isn't a special case, remove the "es"
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
 * Converts a string into camelCase.
 * @param str - The string to be converted into camelCase
 * @returns The camelCase version of the string
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index === 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}
