'use client'

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns'
import { type FC } from 'react'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/components/ui/PathLink'
import { Header1, Header2 } from '~/components/ui/headers'
import { usePreferences } from '~/trpc/hooks'
import { api } from '~/trpc/react'
import { cn, getCategoryColor } from '~/utils/classnames'
import { daysAway, timeFormat } from '~/utils/dates'

export const DateEvents: FC<{
  date: Date
}> = ({ date }) => {
  const formattedDay = format(date, 'yyyy-MM-dd')

  const { data: events, isLoading } = api.event.range.useQuery({
    start: startOfDay(date),
    end: endOfDay(date),
  })

  const { preferences } = usePreferences()

  const inXDays = daysAway(date)

  return (
    <InnerPageLayout
      headerLeft={
        !isLoading ? (
          <PathLink
            path="/day/:date"
            params={{ date: format(subDays(date, 1), 'yyyy-MM-dd') }}
          >
            <ArrowLeftIcon height={20} />
          </PathLink>
        ) : (
          <ArrowLeftIcon height={20} className="opacity-50" />
        )
      }
      title={
        <div className="flex flex-col items-center">
          <Header1 className="relative flex h-8 items-baseline gap-2 text-2xl">
            {format(date, 'do MMM yyyy')}
          </Header1>
          <Header2 className="text-base font-normal text-neutral-500">
            {inXDays}
          </Header2>
        </div>
      }
      headerRight={
        !isLoading ? (
          <PathLink
            path="/day/:date"
            params={{ date: format(addDays(date, 1), 'yyyy-MM-dd') }}
          >
            <ArrowRightIcon height={20} />
          </PathLink>
        ) : (
          <ArrowRightIcon height={20} className="opacity-50" />
        )
      }
    >
      <ul className="flex flex-col gap-2">
        {events?.map((event) => (
          <li key={event.id}>
            <PathLink
              path="/events/:id"
              params={{ id: event.id }}
              query={{
                origin: `day-${formattedDay}`,
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
        ))}
        {events?.length === 0 && <li>No events {inXDays}</li>}
      </ul>
    </InnerPageLayout>
  )
}
