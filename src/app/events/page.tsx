import { addDays, endOfDay, format, startOfDay } from 'date-fns'
import { redirect } from 'next/navigation'
import { BackButton } from '~/components/BackButton'
import { PageLayout } from '~/components/layout/PageLayout'
import { Alert } from '~/components/ui/Alert'
import { PathLink } from '~/components/ui/PathLink'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { cn, getCategoryColor } from '~/utils/classnames'

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

  const events = await api.event.range.query({
    start: startOfDay(new Date()),
    end: endOfDay(addDays(new Date(), 90)),
  })

  return (
    <PageLayout
      headerLeft={<BackButton whenLastLocation="/profile" />}
      title="Upcoming Events"
    >
      {error === 'not-found' && (
        <Alert level="error" message="Event not found" className="mb-4" />
      )}
      <ul className="flex flex-col gap-2">
        {events.map((event) => (
          <li key={event.id}>
            <PathLink
              path="/events/:id"
              params={{ id: event.id }}
              className={cn(
                'flex items-center justify-start overflow-hidden rounded-lg px-2 py-1 hover:bg-neutral-900 md:flex-row md:items-center md:gap-1'
              )}
            >
              <div className="flex items-start justify-start gap-1 overflow-hidden md:gap-2">
                <div
                  className={cn(
                    'mt-1 h-4 w-1 flex-shrink-0 rounded-full',
                    getCategoryColor(event.category?.color, 'bg')
                  )}
                ></div>
                <div
                  className={cn(
                    'flex-grow-0 truncate text-left text-lg leading-snug'
                  )}
                >
                  {event.title}
                </div>
              </div>
              {event.timeStatus === 'STANDARD' ? (
                <div className="whitespace-nowrap leading-tight text-neutral-500 md:pl-2">
                  @ {format(event.datetime, 'HH:mm')}
                </div>
              ) : event.timeStatus === 'ALL_DAY' ? (
                <div className="whitespace-nowrap leading-tight text-neutral-500 md:pl-2">
                  All Day
                </div>
              ) : null}
            </PathLink>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
