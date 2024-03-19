import '~/styles/globals.css'

import { Atkinson_Hyperlegible } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

import { TRPCReactProvider } from '~/trpc/react'

const atkinson_hyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'asdougl/calendar',
  description: 'Asdougl Calendar - A calendar for non-calendar people',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`bg-neutral-950 font-sans text-neutral-100 ${atkinson_hyperlegible.variable}`}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  )
}
