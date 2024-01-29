'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { WeekViewSimple } from './week-view-simple'
import Loading from './loading'

export default function WeekPage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <Loading />
  } else if (status === 'unauthenticated') {
    redirect('/login')
  }

  return <WeekViewSimple />
}
