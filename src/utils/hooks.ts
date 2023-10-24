import type { EffectCallback } from 'react'
import { useEffect, useRef, useState } from 'react'
import { type ZodSchema } from 'zod'

/**
 * A hook that returns a debounced value.
 */
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

/**
 * A hook that executes code only on component mount.
 */
export const useMountEffect = (callback: EffectCallback) => {
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return callback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/**
 * A hook that returns the client timezone.
 * @returns The client timezone.
 */
export const useClientTimezone = () => {
  const [timezone, setTimezone] =
    useState<Intl.DateTimeFormatOptions['timeZone']>()
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])
  return timezone
}

/**
 * A hook to return the client's date
 * @returns The current date as per the client's timezone.
 */
export const useClientNow = ({
  initialDate,
  modifier,
}: {
  initialDate?: Date
  modifier?: (date: Date) => Date
}) => {
  const [date, setDate] = useState(initialDate || new Date())
  useEffect(() => {
    // resets the date based on the client's timezone
    setDate(modifier ? modifier(new Date()) : new Date())
  }, [modifier])
  return [date, setDate] as const
}
