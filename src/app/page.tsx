'use client'

import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Inbox } from './inbox'
import { Navbar } from '~/components/Navbar'
import { FullPageLoader } from '~/components/ui/FullPageLoader'

export default function Home() {
  const { data, status } = useSession()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (!data?.user) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col">
      <Inbox />
      <Navbar />
    </main>
  )
}
