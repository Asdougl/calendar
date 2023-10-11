'use client'

import './globals.css'
import { Atkinson_Hyperlegible } from 'next/font/google'
import Providers from './providers'

const atkinson_hyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`text-neutral-100 bg-neutral-950 ${atkinson_hyperlegible.className}`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
