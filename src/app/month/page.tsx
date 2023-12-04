'use client'

import { useSession } from 'next-auth/react'
import { differenceInCalendarWeeks, endOfMonth, startOfMonth } from 'date-fns'
import { redirect } from 'next/navigation'
import { MonthView } from './month-view'
import Loading from './loading'
import { OuterPageLayout } from '~/components/layout/PageLayout'

export default function Month() {
  const { status } = useSession()

  const weeksInMonth =
    differenceInCalendarWeeks(
      startOfMonth(new Date()),
      endOfMonth(new Date())
    ) + 1

  if (status === 'loading') {
    return <Loading weekCount={weeksInMonth} />
  } else if (status === 'unauthenticated') {
    redirect('/login')
  }

  return (
    <OuterPageLayout fullscreen>
      <MonthView />
    </OuterPageLayout>
  )
}
