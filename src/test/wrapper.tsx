/* eslint-disable react-refresh/only-export-components */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink } from '@trpc/client'
import { useState, type ReactNode } from 'react'
import { api } from '~/trpc/react'
import { getUrl, transformer } from '~/trpc/shared'

export const testQueryClient = new QueryClient()

export const TestWrapper = ({ children }: { children: ReactNode }) => {
  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        httpLink({
          url: getUrl(),
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
