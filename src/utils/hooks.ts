import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import type { Dispatch, EffectCallback, SetStateAction } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import throttle from 'lodash/throttle'
import { startOfDay } from 'date-fns'
import { getWindow } from '~/utils/misc'

/**
 * A hook that returns a debounced value.
 */
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number
): [
  debouncedValue: T,
  setValue: Dispatch<SetStateAction<T>>,
  isDebounced: boolean,
  undebouncedValue: T,
] => {
  const [value, setValue] = useState(initialValue)
  const [debouncedValue, setDebouncedValue] = useState(initialValue)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => clearTimeout(timeout)
  }, [value, delay])
  return [debouncedValue, setValue, value === debouncedValue, value]
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
 * A hook that executes code only on component mount.
 */
export const useMountLayoutEffect = (callback: EffectCallback) => {
  const mountedRef = useRef(false)

  useLayoutEffect(() => {
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
export const useClientNow = (
  props: {
    initialDate?: Date
    modifier?: (date: Date) => Date
  } | void
) => {
  const [date, setDate] = useState(props?.initialDate || new Date())
  useEffect(() => {
    // resets the date based on the client's timezone
    setDate(props?.modifier?.(new Date()) || new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.modifier])
  return [date, setDate] as const
}

/**
 * UseState but it persists in the React-Query cache.
 * @param key Key of your query-state
 * @param initialState Initial value for your query-state
 * @returns Touple of your query-state and a function to update your query-state
 */
export const useQueryState = <T>(key: string, initialState: T) => {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['query-state', key],
    initialData: initialState,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const updateQueryState = (data: T) => {
    queryClient.setQueryData(['query-state', key], data)
  }

  return [data, updateQueryState] as const
}

export const useStateMap = <Key extends string, Value>(
  initialState?: Partial<Record<Key, Value>>
) => {
  const [map] = useState(() => {
    const initialMap = new Map<Key, Value>()

    if (initialState) {
      for (const [key, value] of Object.entries(initialState)) {
        initialMap.set(key as Key, value as Value)
      }
    }

    return initialMap
  })
  const [, render] = useState(Date.now())

  const get = (key: Key) => {
    return map.get(key)
  }

  const set = (key: Key, value: Value) => {
    const old = map.get(key)
    if (old === value) return
    map.set(key, value)
    render(Date.now())
  }

  const remove = (key: Key) => {
    if (!map.has(key)) return
    map.delete(key)
    render(Date.now())
  }

  const has = (key: Key) => {
    return map.has(key)
  }

  const clear = () => {
    map.clear()
    render(Date.now())
  }

  const values = () => map.values()

  const keys = () => map.keys()

  const entries = () => map.entries()

  return {
    get,
    set,
    delete: remove,
    has,
    clear,
    values,
    keys,
    entries,
    get size() {
      return map.size
    },
  } as const
}

export const useStateSet = <T>(initialValue: T[] = []) => {
  const [stateSet] = useState(new Set<T>(initialValue))
  const [, render] = useState(Date.now())

  const triggerRender = () => {
    render((value) => value + 1)
  }

  const add = (item: T) => {
    stateSet.add(item)
    triggerRender()
  }

  const remove = (item: T) => {
    stateSet.delete(item)
    triggerRender()
  }

  const has = (item: T) => stateSet.has(item)

  const clear = () => {
    stateSet.clear()
    triggerRender()
  }

  const values = () => stateSet.values()

  const keys = () => stateSet.keys()

  const entries = () => stateSet.entries()

  const toArray = (): T[] => Array.from(stateSet)

  const set = (items: T[]) => {
    stateSet.clear()
    items.forEach((item) => stateSet.add(item))
    triggerRender()
  }

  return {
    add,
    set,
    delete: remove,
    has,
    clear,
    values,
    keys,
    entries,
    toArray,
    addStart: (item: T) => {
      const allItems = toArray()
      set([item, ...allItems])
    },
    addEnd: add,
    trimStart: (count: number) => {
      const allItems = toArray()
      set(allItems.slice(count))
    },
    trimEnd: (count: number) => {
      const allItems = toArray()
      set(allItems.slice(0, allItems.length - count))
    },
    get size() {
      return stateSet.size
    },
  } as const
}

export const useToggle = (initialState: boolean) => {
  const [state, setState] = useState(initialState)

  const toggle = (newState?: boolean) => {
    if (newState === undefined) {
      setState((value) => !value)
    } else {
      setState(newState)
    }
  }

  return [state, toggle] as const
}

export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: getWindow()?.innerWidth || 0,
    height: getWindow()?.innerHeight || 0,
  })

  useEffect(() => {
    const handleResize = throttle(() => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }, 100)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return viewport
}

export const useClientDate = () => {
  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
    setDate(startOfDay(new Date()))
  }, [])

  return [date, setDate] as const
}

export const useClientParamDate = (param: string) => {
  const searchParams = useSearchParams()

  const paramValue = searchParams.get(param)

  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
    if (!paramValue) return
    const date = new Date(paramValue)
    if (isNaN(date.getTime())) return
    setDate(startOfDay(date))
  }, [paramValue])

  return [date, setDate] as const
}

export const createClientDateRangeHook =
  <T>({
    param,
    initialState,
    processor,
  }: {
    param?: string
    initialState: T
    processor: (date: Date) => T
  }) =>
  () => {
    const searchParams = useSearchParams()

    const paramValue = param ? searchParams.get(param) : null

    const [date, setDate] = useState<T>(initialState)

    const mountedRef = useRef(false)

    useEffect(() => {
      mountedRef.current = true
      if (!paramValue) {
        setDate(processor(new Date()))
        return
      }
      const date = new Date(paramValue)
      if (isNaN(date.getTime())) {
        setDate(processor(new Date()))
        return
      }
      setDate(processor(date))
    }, [paramValue])

    return [date, mountedRef.current, setDate, paramValue] as const
  }
