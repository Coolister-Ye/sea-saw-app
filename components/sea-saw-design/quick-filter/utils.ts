import dayjs from "dayjs";

import { QuickFilterOption } from "./types";

const RELATIVE_DATE_RESOLVERS: Record<string, () => string> = {
  __today__: () => dayjs().format("YYYY-MM-DD"),
};

/** Resolve a params value — supports factory functions and __placeholder__ date strings. */
export function resolveParams(
  params: QuickFilterOption["params"],
): Record<string, any> {
  const resolved = typeof params === "function" ? params() : params;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(resolved)) {
    const resolver = typeof value === "string" ? RELATIVE_DATE_RESOLVERS[value] : undefined;
    result[key] = resolver ? resolver() : value;
  }
  return result;
}
