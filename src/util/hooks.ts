import type { EffectCallback } from 'react'
import { useEffect, useRef, useState } from 'react'

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
    console.log({ timezone: Intl.DateTimeFormat().resolvedOptions() })
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])
  return timezone
}
