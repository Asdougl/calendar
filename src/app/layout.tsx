import '~/styles/globals.css'

import { Atkinson_Hyperlegible } from 'next/font/google'
import { cookies } from 'next/headers'

import { TRPCReactProvider } from '~/trpc/react'
import { LastLocationProvider } from '~/utils/context'

const atkinson_hyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Asdougl Calendar',
  description: "Asdougl's personal calendar app",
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
        <TRPCReactProvider cookies={cookies().toString()}>
          <LastLocationProvider>{children}</LastLocationProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
