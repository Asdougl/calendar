import { getQueryKey } from '@trpc/react-query'
import { testQueryClient } from './wrapper'

export const mockTRPC = (
  target: Parameters<typeof getQueryKey>[0],
  mockData: unknown
) => {
  const key = getQueryKey(target)
  testQueryClient.setQueryDefaults(key, {
    staleTime: Infinity,
    refetchInterval: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
  testQueryClient.setQueryData(key, mockData)
}
