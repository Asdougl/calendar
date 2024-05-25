'use client'

import { ClockIcon, PlusIcon } from '@heroicons/react/24/solid'
import { format, isSameMonth, startOfDay, startOfMonth } from 'date-fns'
import { Fragment, useState } from 'react'
import { SkeletonDivider, SkeletonEvent } from './skeleton'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Alert } from '~/components/ui/Alert'
import { PathLink } from '~/utils/nav/Link'
import { SubmitButton } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, color } from '~/utils/classnames'
import { Duration, isEventComplete, timeFormat } from '~/utils/dates'
import { usePreferences } from '~/trpc/hooks'
import { stdFormat } from '~/components/ui/dates/common'
import { SEARCH_PARAM_NEW } from '~/utils/nav/search'
import { useQueryParams } from '~/utils/nav/hooks'

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
}

export const EventsList = ({ notFound, direction }: EventsListProps) => {
  const [starting] = useState(() => startOfDay(new Date()))

  const [searchParams] = useQueryParams()
  const query = searchParams.get('q') ?? undefined
  const category = searchParams.get('category') ?? undefined

  const { preferences } = usePreferences()

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
      timeDirection: direction,
      query,
      category,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: Duration.minutes(2),
      refetchInterval: Duration.minutes(5),
    }
  )

  return (
    <InnerPageLayout
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
        <Alert level="error" title="Event not found" className="mb-4" />
      )}
      {query && <PathLink path="/events">Clear</PathLink>}
      <ul className="flex flex-col gap-2 overflow-auto">
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
                  <li className="flex w-full items-center justify-between pt-6">
                    <PathLink
                      path="/month"
                      query={{ of: stdFormat(startOfMonth(event.datetime)) }}
                      className="rounded px-2 text-lg font-semibold text-neutral-300 lg:hover:bg-neutral-800"
                    >
                      {format(event.datetime, 'MMMM yyyy')}
                    </PathLink>
                    {direction !== 'before' && (
                      <PathLink
                        path="/events"
                        query={{
                          event: SEARCH_PARAM_NEW,
                          date: stdFormat(startOfMonth(event.datetime)),
                        }}
                        className="group flex items-center justify-between gap-1 rounded px-2 text-neutral-300 hover:text-neutral-50 lg:hover:bg-neutral-800"
                      >
                        <span className="opacity-0 transition-opacity lg:group-hover:opacity-100">
                          Add Event in {format(event.datetime, 'MMM')}
                        </span>
                        <PlusIcon height={20} />
                      </PathLink>
                    )}
                  </li>
                )}
                <li>
                  <PathLink
                    path={direction === 'before' ? '/events/past' : '/events'}
                    query={{
                      event: event.id,
                    }}
                    className={cn(
                      'group flex items-center justify-between gap-1 overflow-hidden rounded-lg px-2 py-1 transition-colors lg:hover:bg-neutral-900',
                      event.category?.color
                        ? color('bg-dull')(event.category.color)
                        : 'bg-neutral-800'
                    )}
                  >
                    <div className="flex items-center justify-start gap-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-10 w-1 flex-shrink-0 rounded-full',
                          color('bg')(event.category?.color)
                        )}
                      ></div>
                      <div className="flex flex-col overflow-hidden">
                        <div
                          className={cn(
                            'flex-grow-0 truncate text-left text-lg leading-snug',
                            {
                              'text-neutral-500 line-through':
                                isEventComplete(event),
                            }
                          )}
                        >
                          {event.title}
                        </div>
                        <div
                          className={cn(
                            'flex gap-1 whitespace-nowrap leading-tight',
                            color('text')(event.category?.color)
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
              <div className="flex items-center justify-center">
                <SubmitButton
                  type="button"
                  loading={isFetchingNextPage}
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  See more
                </SubmitButton>
              </div>
            ) : (
              <span className="px-2 pt-6 italic text-neutral-500">
                No more {direction === 'before' ? 'past' : 'upcoming'} events{' '}
                {query && `for "${query}"`}
              </span>
            )}
          </li>
        )}
      </ul>
    </InnerPageLayout>
  )
}
