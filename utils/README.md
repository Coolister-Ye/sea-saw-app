# Utils Directory

This directory contains organized utility functions for the Sea-Saw application.

## Directory Structure

```
utils/
├── api.ts          # API-related utilities (field mappings, stripping IDs)
├── form.ts         # Form data handling (FormData conversion)
├── format.ts       # Number, currency, and percentage formatting
├── http.ts         # HTTP requests and URL utilities (fetch, JWT)
├── logger.ts       # Environment-aware logging (dev-only logs)
├── object.ts       # Object manipulation (JSON operations, boolean normalization)
├── storage.ts      # Local storage utilities (SecureStore/AsyncStorage)
├── string.ts       # String manipulation (capitalize, pluralize, camelCase)
├── table.ts        # Complex table data serialization and flattening
├── validator.ts    # Yup validation schema generation
├── index.ts        # Centralized exports for all utilities
└── README.md       # This documentation file
```

## Usage

### Recommended: Import from index

```typescript
// Import multiple utilities from the index
import { formatNumber, capitalizeString, fetchJson } from '@/utils';
```

### Alternative: Import from specific files

```typescript
// Import from specific file if you only need one function
import { formatNumber } from '@/utils/format';
```

## Available Utilities

### API Utilities (`api.ts`)
- `getFieldLabelMap()` - Create field name to label mappings
- `stripIdsDeep()` - Remove id and pk fields recursively
- `stripDeep()` - Remove specified fields recursively

### Form Utilities (`form.ts`)
- `prepareRequestBody()` - Convert object to FormData if files present
- `objectToFormData()` - Convert nested object to FormData using `object-to-formdata` package
  - Uses standard bracket notation: `production_orders[0][id]`
  - More reliable than custom implementation
  - Supports configurable options

### Formatting Utilities (`format.ts`)
- `formatNumber()` - Format number with fixed decimals
- `formatNumberTrim()` - Format number with trailing zeros trimmed
- `formatCurrency()` - Format as USD currency
- `formatPercentage()` - Format decimal as percentage
- `calcPercent()` - Calculate percentage between two numbers

### HTTP Utilities (`http.ts`)
- `fetchJson()` - Fetch with automatic JSON parsing and token refresh
- `getBaseUrl()` - Get API base URL from environment
- `getUrl()` - Get full API URL by key
- `getJwtHeader()` - Get Bearer token headers
- `FetchError` - Custom fetch error class

### Object Utilities (`object.ts`)
- `isJsonObject()` - Check if value is plain object
- `getLength()` - Get length of array or object
- `isObjectEmpty()` - Check if all object values are null
- `isJsonEmpty()` - Check if all values are null or empty strings
- `json2Str()` - Convert JSON to readable string
- `normalizeBoolean()` - Convert value to boolean
- `reorderDefs()` - Reorder object properties

### Storage Utilities (`storage.ts`)
- `getLocalData()` - Get data from SecureStore/AsyncStorage
- `setLocalData()` - Store data in SecureStore/AsyncStorage
- `removeLocalData()` - Remove data from storage

### String Utilities (`string.ts`)
- `splitAndUpperCaseString()` - Split by underscore and uppercase
- `capitalizeString()` - Capitalize first letter
- `changeToPlural()` - Convert singular to plural
- `toSingular()` - Convert plural to singular
- `toCamelCase()` - Convert to camelCase

### Table Utilities (`table.ts`)
- `flattenData()` - Flatten nested JSON for table display
- `flattenHeaderMeta()` - Extract headers from nested structure
- `unFlattenData()` - Convert flat data back to nested
- `mergeData()` - Merge two datasets based on structure
- `deleteLevel()` - Collect keys for rows with rowSpan=1

### Validation Utilities (`validator.ts`)
- `validator()` - Create Yup schema from field definitions

### Logger Utilities (`logger.ts`)
- `devLog()` - Log in development mode only (replaces `console.log`)
- `devWarn()` - Warning in development mode only (replaces `console.warn`)
- `devError()` - Error in development mode only (replaces `console.error`)
- `devDebug()` - Debug message with label in development mode
- `devGroup()` - Group messages in development mode

## Migration from `utlis`

The old `utlis` directory (note the typo) has been replaced with this properly-named `utils` directory. All imports have been updated automatically:

- `@/utlis/commonUtils` → `@/utils`
- `@/utlis/formatUtils` → `@/utils`
- `@/utlis/apiUtils` → `@/utils`
- `@/utlis/formDataHelper` → `@/utils`
- `@/utlis/storageHelper` → `@/utils`
- `@/utlis/webHelper` → `@/utils`
- `@/utlis/serializer` → `@/utils`
- `@/utlis/validator` → `@/utils/validator`

## Changes from Original

### Improvements
1. **Fixed typo**: `utlis` → `utils`
2. **Better organization**: Split large files into focused modules
3. **Centralized exports**: Use `utils/index.ts` for convenient imports
4. **Fixed naming**: `isObejctEmpty` → `isObjectEmpty`
5. **Removed unused files**: `exampleData.ts`, `fieldConverter.tsx`
6. **Consolidated formatting**: Merged duplicate formatting functions
7. **Code reuse**: `stripIdsDeep` now reuses `stripDeep` implementation
8. **Better FormData handling**: Using `object-to-formdata` package instead of custom implementation
   - More reliable and tested
   - Standard bracket notation (`array[0][field]` instead of `array.0.field`)
   - Better compatibility with backend parsers
9. **Environment-aware logging**: New `logger.ts` module
   - All logs automatically disabled in production
   - No need to check `NODE_ENV` in every log statement
   - Cleaner code with `devLog()`, `devWarn()`, `devError()`, etc.

### File Mapping
- `commonUtils.ts` → Split into `string.ts`, `object.ts`, `format.ts`
- `formatUtils.ts` → Merged into `format.ts`
- `storageHelper.ts` → Renamed to `storage.ts`
- `webHelper.ts` → Renamed to `http.ts`
- `serializer.ts` → Renamed to `table.ts`
- `apiUtils.ts` → Kept as `api.ts`
- `formDataHelper.ts` → Renamed to `form.ts`
- `validator.ts` → Kept as `validator.ts`
