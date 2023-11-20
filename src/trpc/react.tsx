'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { SessionProvider } from 'next-auth/react'
import { getUrl, transformer } from './shared'
import { type AppRouter } from '~/server/api/root'

// eslint-disable-next-line react-refresh/only-export-components
export const api = createTRPCReact<AppRouter>()

export function TRPCReactProvider(props: {
  children: React.ReactNode
  cookies: string
}) {
  const [queryClient] = useState(() => new QueryClient())

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer,
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: getUrl(),
          headers() {
            return {
              cookie: props.cookies,
              'x-trpc-source': 'react',
            }
          },
        }),
      ],
    })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <api.Provider client={trpcClient} queryClient={queryClient}>
          {props.children}
          <ReactQueryDevtools />
        </api.Provider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
