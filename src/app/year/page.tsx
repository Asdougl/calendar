'use client'
import { Navbar } from '~/components/Navbar'
import { Header1 } from '~/components/ui/headers'
import { Paragraph } from '~/components/ui/paragraph'

export default function Year() {
  return (
    <main className="flex h-screen flex-col">
      <div className="flex flex-grow flex-col items-center pt-16">
        <Header1>Year View</Header1>
        <Paragraph>Coming soon...</Paragraph>
      </div>
      <Navbar />
    </main>
  )
}
