/**
 * Shared utility functions for Comoon
 */

/**
 * Escape special characters in SQL LIKE patterns to prevent
 * unintended wildcard matching from user input.
 */
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_\\]/g, '\\$&');
}

/**
 * Safely parse a JSON string, returning a fallback value
 * if the input is null, undefined, or malformed.
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
