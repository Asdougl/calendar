/* eslint-disable react-refresh/only-export-components */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { unstable_httpBatchStreamLink } from '@trpc/client'
import { useState, type ReactNode } from 'react'
import { SuperJSON } from 'superjson'
import { api, getBaseUrl } from '~/trpc/react'

export const testQueryClient = new QueryClient()

export const TestWrapper = ({ children }: { children: ReactNode }) => {
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        unstable_httpBatchStreamLink({
          transformer: SuperJSON,
          url: getBaseUrl() + '/api/trpc',
          headers() {
            return {
              'x-trpc-source': 'react',
            }
          },
        }),
      ],
    })
  )

  return (
    <QueryClientProvider client={testQueryClient}>
      <api.Provider client={trpcClient} queryClient={testQueryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  )
}
