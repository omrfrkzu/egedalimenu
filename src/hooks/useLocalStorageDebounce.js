import { useEffect, useRef } from 'react'

/**
 * localStorage'a yazmayı debounce eden hook
 * Çok sık localStorage yazmayı önler, performansı artırır
 */
export function useLocalStorageDebounce(key, value, delay = 500) {
  const timeoutRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
          console.error(`${key} kaydedilemedi:`, error)
        }
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [key, value, delay])
}

