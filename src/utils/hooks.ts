import type { EffectCallback } from 'react'
import { useEffect, useRef, useState } from 'react'
import { type ZodSchema } from 'zod'

export const useDebouncedState = <T>(initialValue: T, delay: number) => {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])
  return [debouncedValue, setValue, value === debouncedValue, value] as const
}

export const useMountEffect = (callback: EffectCallback) => {
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return callback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useClientTimezone = () => {
  const [timezone, setTimezone] =
    useState<Intl.DateTimeFormatOptions['timeZone']>()
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])
  return timezone
}

export const useLocalStorage = <T>(key: string, validator: ZodSchema<T>) => {
  const [value, setValue] = useState(validator.parse({}))

  useEffect(() => {
    const storedValue = localStorage.getItem(key)
    if (storedValue) {
      try {
        setValue(validator.parse(JSON.parse(storedValue)))
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }
  }, [key, validator])

  const setLocalStorageValue = (newValue: T) => {
    localStorage.setItem(key, JSON.stringify(newValue))
    setValue(newValue)
  }

  return [value, setLocalStorageValue] as const
}
