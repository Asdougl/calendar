'use client'

import { ClockIcon, PlusIcon } from '@heroicons/react/24/solid'
import { format, isSameMonth, startOfMonth } from 'date-fns'
import { Fragment, useState } from 'react'
import { SkeletonDivider, SkeletonEvent } from './skeleton'
import { BackButton } from '~/components/BackButton'
import { PageLayout } from '~/components/layout/PageLayout'
import { Alert } from '~/components/ui/Alert'
import { PathLink } from '~/components/ui/PathLink'
import { SubmitButton } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, getCategoryColor } from '~/utils/classnames'
import { time, timeFormat } from '~/utils/dates'
import { usePreferences } from '~/trpc/hooks'

type ListEvent = RouterOutputs['event']['upcoming']['items'][number]

type ShowMonthTitleParams = {
  event: ListEvent
  index: number
  page: ListEvent[]
  lastPage: ListEvent[] | undefined
}

const showMonthTitle = ({
  event,
  index,
  page,
  lastPage,
}: ShowMonthTitleParams) => {
  if (index === 0) {
    if (lastPage) {
      const lastEvent = lastPage[lastPage.length - 1]
      if (!lastEvent) return true
      return !isSameMonth(event.datetime, lastEvent.datetime)
    }
    return true
  }
  const prevEvent = page[index - 1]
  if (!prevEvent) return false
  return !isSameMonth(event.datetime, prevEvent.datetime)
}

type EventsListProps = {
  notFound?: boolean
  direction?: 'before' | 'after'
  initialPreferences: RouterOutputs['preferences']['getAll']
}

export const EventsList = ({
  notFound,
  direction,
  initialPreferences,
}: EventsListProps) => {
  const [starting] = useState(() => new Date())

  const { preferences } = usePreferences(initialPreferences)

  const {
    data: events,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = api.event.upcoming.useInfiniteQuery(
    {
      starting: starting,
      limit: 10,
      direction,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: time.minutes(2),
      refetchInterval: time.minutes(5),
    }
  )

  return (
    <PageLayout
      headerLeft={!isLoading && <BackButton whenLastLocation="/profile" />}
      title={direction === 'before' ? 'Past Events' : 'Upcoming Events'}
      headerRight={
        !isLoading && (
          <PathLink
            path={direction === 'before' ? '/events' : '/events/past'}
            className="flex h-full items-center justify-center text-neutral-500 hover:text-neutral-50"
          >
            <ClockIcon
              height={20}
              style={{
                transform: `scaleX(${direction === 'before' ? -1 : 1})`,
              }}
            />
          </PathLink>
        )
      }
      skeleton={isLoading}
    >
      {notFound && (
        <Alert level="error" message="Event not found" className="mb-4" />
      )}
      <ul className="flex flex-col gap-2">
        {isLoading && (
          <>
            <SkeletonDivider />
            <SkeletonEvent />
            <SkeletonEvent />
            <SkeletonEvent />
            <SkeletonEvent />
            <SkeletonEvent />
            <SkeletonDivider />
            <SkeletonEvent />
            <SkeletonEvent />
            <SkeletonEvent />
          </>
        )}
        {events?.pages.map((page, i, pages) => (
          <Fragment key={i}>
            {page.items.map((event, j, page) => (
              <Fragment key={event.id}>
                {showMonthTitle({
                  event,
                  index: j,
                  page,
                  lastPage: pages[i - 1]?.items,
                }) && (
                  <li className="w-full pt-6">
                    <PathLink
                      path="/events/:id"
                      params={{ id: 'new' }}
                      query={{
                        date: format(
                          isSameMonth(starting, event.datetime)
                            ? starting
                            : startOfMonth(event.datetime),
                          'yyyy-MM-dd'
                        ),
                        origin: direction === 'before' ? 'past' : undefined,
                      }}
                      className="group flex items-center justify-between gap-1 text-neutral-300 hover:text-neutral-50"
                    >
                      <div className="text-lg font-semibold text-neutral-300">
                        {format(event.datetime, 'MMMM yyyy')}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <span className="opacity-0 transition-opacity group-hover:opacity-100">
                          Event in {format(event.datetime, 'MMM')}
                        </span>
                        <PlusIcon height={20} />
                      </div>
                    </PathLink>
                  </li>
                )}
                <li>
                  <PathLink
                    path="/events/:id"
                    params={{ id: event.id }}
                    query={{
                      origin: direction === 'before' ? 'past' : undefined,
                    }}
                    className={cn(
                      'group flex items-center justify-between gap-1 overflow-hidden rounded-lg px-2 py-1 transition-colors lg:hover:bg-neutral-900',
                      event.category?.color
                        ? getCategoryColor(event.category.color, 'bg-dull')
                        : 'bg-neutral-800'
                    )}
                  >
                    <div className="flex items-center justify-start gap-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-10 w-1 flex-shrink-0 rounded-full',
                          getCategoryColor(event.category?.color, 'bg')
                        )}
                      ></div>
                      <div className="flex flex-col overflow-hidden">
                        <div
                          className={cn(
                            'flex-grow-0 truncate text-left text-lg leading-snug'
                          )}
                        >
                          {event.title}
                        </div>
                        <div
                          className={cn(
                            'flex gap-1 whitespace-nowrap leading-tight',
                            getCategoryColor(event.category?.color, 'text')
                          )}
                        >
                          {format(event.datetime, 'EEEE, MMM d')}
                          {event.timeStatus === 'STANDARD' ? (
                            <div className="">
                              - {timeFormat(event.datetime, preferences)}
                            </div>
                          ) : event.timeStatus === 'ALL_DAY' ? (
                            <div className="">- All Day</div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 opacity-0 transition-opacity group-hover:opacity-100">
                      Edit
                    </div>
                  </PathLink>
                </li>
              </Fragment>
            ))}
          </Fragment>
        ))}
        {!isLoading && (
          <li className="pt-6">
            {hasNextPage ? (
              <SubmitButton
                type="button"
                loading={isFetchingNextPage}
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                See more
              </SubmitButton>
            ) : (
              <span className="px-2 pt-6 italic text-neutral-500">
                No more {direction === 'before' ? 'past' : 'upcoming'} events
              </span>
            )}
          </li>
        )}
      </ul>
    </PageLayout>
  )
}
