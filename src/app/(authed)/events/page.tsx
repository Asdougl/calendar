import { EventsList } from './events-list'

type PageParams = {
  searchParams: {
    error?: string
  }
}

export default function EventsPage({ searchParams: { error } }: PageParams) {
  return <EventsList notFound={error === 'not-found'} />
}
