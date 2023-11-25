import { redirect } from 'next/navigation'
import { EventsList } from './events-list'
import { getServerAuthSession } from '~/server/auth'

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

  return <EventsList notFound={error === 'not-found'} />
}
