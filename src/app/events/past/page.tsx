import { redirect } from 'next/navigation'
import { EventsList } from '../events-list'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'

export default async function PastEventsPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return <EventsList direction="before" initialPreferences={preferences} />
}
