import { useEffect, useRef } from 'react'

/**
 * Custom hook untuk debounce callback
 * Mengikuti prinsip DRY - reusable untuk semua search inputs
 *
 * @param callback - Function yang akan di-debounce
 * @param delay - Delay dalam milliseconds (default: 500ms)
 * @param dependencies - Array dependencies seperti useEffect
 */
export function useDebounce(
  callback: () => void,
  delay: number = 500,
  dependencies: unknown[] = []
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}
