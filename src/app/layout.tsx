import '~/styles/globals.css'

import { Atkinson_Hyperlegible } from 'next/font/google'
import { headers } from 'next/headers'

import { TRPCReactProvider } from '~/trpc/react'

const atkinson_hyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Asdougl Calendar',
  description: "Asdougl's personal calendar app",
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
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
        <TRPCReactProvider headers={headers()}>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
