'use client'

import { useSession } from 'next-auth/react'
import { redirect, useSearchParams } from 'next/navigation'
import { Inbox } from './inbox'
import Loading from './loading'
import { OuterPageLayout } from '~/components/layout/PageLayout'

export default function InboxPage() {
  const searchParams = useSearchParams()
  const { status } = useSession()

  if (status === 'loading') {
    return <Loading />
  } else if (status === 'unauthenticated') {
    redirect('/login')
  }

  return (
    <OuterPageLayout fullscreen>
      <Inbox eventId={searchParams.get('event') ?? undefined} />
    </OuterPageLayout>
  )
}
