import { EventsList } from './events-list'
import { isAuthed } from '~/utils/auth'

type PageParams = {
  searchParams: {
    error?: string
  }
}

export default async function EventsPage({
  searchParams: { error },
}: PageParams) {
  await isAuthed()

  return <EventsList notFound={error === 'not-found'} />
}
