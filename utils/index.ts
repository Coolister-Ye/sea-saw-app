/**
 * Centralized exports for all utility functions
 * Import from '@/utils' instead of individual files
 */

// API utilities
export {
  getFieldLabelMap,
  stripIdsDeep,
  stripDeep,
} from "./api";

// Formatting utilities
export {
  formatNumber,
  formatNumberTrim,
  formatCurrency,
  formatPercentage,
  calcPercent,
} from "./format";

// Form utilities
export {
  prepareRequestBody,
  objectToFormData,
} from "./form";

// HTTP utilities
export {
  fetchJson,
  getBaseUrl,
  getUrl,
  getJwtHeader,
  FetchError,
} from "./http";

// Object utilities
export {
  isJsonObject,
  getLength,
  isObjectEmpty,
  isJsonEmpty,
  json2Str,
  normalizeBoolean,
  reorderDefs,
} from "./object";

// Storage utilities
export {
  getLocalData,
  setLocalData,
  removeLocalData,
} from "./storage";

// String utilities
export {
  splitAndUpperCaseString,
  capitalizeString,
  changeToPlural,
  toSingular,
  toCamelCase,
} from "./string";

// Table/Serializer utilities
export {
  flattenData,
  flattenHeaderMeta,
  unFlattenData,
  mergeData,
  deleteLevel,
} from "./table";

// Validation utilities
export { validator } from "./validator";

// Logger utilities
export {
  devLog,
  devWarn,
  devError,
  devDebug,
  devGroup,
} from "./logger";
