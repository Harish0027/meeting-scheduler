import { useEffect, useState } from "react";

/**
 * Custom hook for debouncing values
 * Used for search inputs to prevent excessive API calls
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds (default: 500ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes before delay expires
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 * Used for scroll events, resize events, etc.
 *
 * @param callback - The function to throttle
 * @param delay - Throttle delay in milliseconds (default: 300ms)
 * @returns Throttled function
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const [lastRun, setLastRun] = useState<number>(Date.now());

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun >= delay) {
      callback(...args);
      setLastRun(now);
    }
  }) as T;
}
