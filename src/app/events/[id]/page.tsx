import { redirect } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { EditEventForm } from './edit-event-form'
import { PageLayout } from '~/components/layout/PageLayout'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { PathLink } from '~/components/ui/PathLink'
import { pathReplace } from '~/utils/path'

type PathParams = {
  path: '/events' | '/week' | '/inbox' | '/events/past'
  query: Record<string, string | undefined> | undefined
}

const decodeOrigin = ({
  origin,
  eventId,
}: {
  origin?: string
  eventId: string
}): PathParams => {
  if (origin) {
    if (origin.includes('week')) {
      return {
        path: '/week',
        query: {
          start: origin.split('week-')[1],
          event: eventId,
        },
      }
    } else if (origin === 'inbox') {
      return {
        path: '/inbox',
        query: {
          event: eventId,
        },
      }
    } else if (origin === 'past') {
      return {
        path: '/events/past',
        query: undefined,
      }
    }
  }

  return {
    path: '/events',
    query: undefined,
  }
}

type PageParams = {
  params: {
    id: string
  }
  searchParams: {
    origin?: string
    title?: string
    date?: string
    time?: string
    categoryId?: string
  }
}

export default async function EventIdPage({
  params: { id },
  searchParams,
}: PageParams) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  let event = null
  if (id !== 'new') {
    event = await api.event.one.query({ id })

    if (!event) {
      redirect('/events?error=not-found')
    }
  }

  const { path, query } = decodeOrigin({
    origin: searchParams.origin,
    eventId: id,
  })

  return (
    <PageLayout
      title={id === 'new' ? 'New Event' : 'Update Event'}
      headerLeft={
        <PathLink path={path} query={query}>
          <ArrowLeftIcon height={20} />
        </PathLink>
      }
    >
      <EditEventForm
        event={event}
        origin={pathReplace({ path, query })}
        wipValues={{
          title: searchParams?.title,
          date: searchParams?.date,
          time: searchParams?.time,
          categoryId: searchParams?.categoryId,
        }}
      />
    </PageLayout>
  )
}
