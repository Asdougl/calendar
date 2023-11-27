import { redirect } from 'next/navigation'
import { EventsList } from './events-list'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'

type PageParams = {
  searchParams: {
    error?: string
  }
}

export default async function EventsPage({
  searchParams: { error },
}: PageParams) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <EventsList
      notFound={error === 'not-found'}
      initialPreferences={preferences}
    />
  )
}
