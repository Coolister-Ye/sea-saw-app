/**
 * Logging utilities with environment-aware output
 * Logs are only output in development mode
 */

const isDev = process.env.NODE_ENV === "development" || __DEV__;

/**
 * Log a message in development mode only
 * @param args - Arguments to log (same as console.log)
 */
export function devLog(...args: any[]): void {
  if (isDev) {
    console.log(...args);
  }
}

/**
 * Log a warning in development mode only
 * @param args - Arguments to log (same as console.warn)
 */
export function devWarn(...args: any[]): void {
  if (isDev) {
    console.warn(...args);
  }
}

/**
 * Log an error in development mode only
 * @param args - Arguments to log (same as console.error)
 */
export function devError(...args: any[]): void {
  if (isDev) {
    console.error(...args);
  }
}

/**
 * Log a debug message with a label in development mode only
 * @param label - Label for the log message
 * @param data - Data to log
 */
export function devDebug(label: string, data?: any): void {
  if (isDev) {
    if (data !== undefined) {
      console.log(`[DEBUG] ${label}:`, data);
    } else {
      console.log(`[DEBUG] ${label}`);
    }
  }
}

/**
 * Log a group of messages in development mode only
 * @param label - Group label
 * @param callback - Function that logs messages within the group
 */
export function devGroup(label: string, callback: () => void): void {
  if (isDev) {
    console.group(label);
    callback();
    console.groupEnd();
  }
}
