import { redirect } from 'next/navigation'
import { EventsList } from '../events-list'
import { getServerAuthSession } from '~/server/auth'

export default async function PastEventsPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return <EventsList direction="before" />
}
