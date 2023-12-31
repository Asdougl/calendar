import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z, type ZodSchema } from 'zod'
import { useMountEffect } from './hooks'

const localStorageData = <T>({
  schema,
  defaultValues,
}: {
  schema: ZodSchema<T>
  defaultValues: T
}) => ({
  schema,
  defaultValues,
})

const LocalStorageKeys = {
  'local-settings': localStorageData({
    schema: z.object({
      leftWeekends: z.boolean(),
    }),
    defaultValues: {
      leftWeekends: false,
    },
  }),
}
type LocalStorageKeys = typeof LocalStorageKeys
type LocalStorageShape<K extends keyof LocalStorageKeys> = z.infer<
  (typeof LocalStorageKeys)[K]['schema']
>

export type UseLocalStorageParams = {
  key: string
}

export const getFromLocalStorage = <K extends keyof LocalStorageKeys>(
  key: K
): LocalStorageShape<K> => {
  const { schema, defaultValues } = LocalStorageKeys[key]

  if (typeof localStorage === 'undefined') return defaultValues

  const storedValue = localStorage.getItem(key)
  if (storedValue) {
    try {
      return schema.parse(JSON.parse(storedValue))
    } catch (e) {
      return defaultValues
    }
  } else {
    return defaultValues
  }
}

/**
 * A hook that returns a certain value from localStorage.
 * @param key the key to use in localStorage
 * @param validator A zod schema to validate the value
 * @returns The value based on the key and the validator
 *
 * @note The validator should contain default values for all keys.
 */
export const useLocalStorage = <K extends keyof LocalStorageKeys>(key: K) => {
  const { data } = useQuery({
    queryKey: ['localStorage', key],
    queryFn: () => getFromLocalStorage(key),
    initialData: LocalStorageKeys[key].defaultValues,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
  const queryClient = useQueryClient()

  useMountEffect(() => {
    queryClient
      .invalidateQueries({ queryKey: ['localStorage', key] })
      // eslint-disable-next-line no-console
      .catch(console.error)
  })

  const setLocalStorageValue = (
    newValue:
      | z.infer<(typeof LocalStorageKeys)[K]['schema']>
      | ((
          old: z.infer<(typeof LocalStorageKeys)[K]['schema']>
        ) => z.infer<(typeof LocalStorageKeys)[K]['schema']>)
  ) => {
    localStorage.setItem(
      key,
      JSON.stringify(
        typeof newValue === 'function'
          ? newValue(getFromLocalStorage(key))
          : newValue
      )
    )
    queryClient
      .invalidateQueries({ queryKey: ['localStorage', key] })
      // eslint-disable-next-line no-console
      .catch(console.error)
  }

  return [
    data || LocalStorageKeys[key].defaultValues,
    setLocalStorageValue,
  ] as const
}
