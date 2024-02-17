'use client'

import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  PlusIcon,
} from '@heroicons/react/24/solid'
import { addDays, endOfDay, format, startOfDay } from 'date-fns'
import { type FC } from 'react'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { Loader } from '~/components/ui/Loader'
import { PathLink } from '~/components/ui/PathLink'
import { stdFormat } from '~/components/ui/dates/common'
import { Header1, Header2 } from '~/components/ui/headers'
import { usePreferences } from '~/trpc/hooks'
import { api } from '~/trpc/react'
import { cn, getCategoryColor } from '~/utils/classnames'
import { daysAway, timeFormat } from '~/utils/dates'
import { SEARCH_PARAMS, SEARCH_PARAMS_NEW } from '~/utils/searchParams'

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
            path="/week"
            query={{ [SEARCH_PARAMS.OF]: stdFormat(date) }}
            className="flex items-center justify-center"
          >
            <ArrowLeftIcon height={20} />
          </PathLink>
        ) : (
          <div className="flex items-center justify-center">
            <ArrowLeftIcon height={20} className="opacity-50" />
          </div>
        )
      }
      title={
        <div className="flex flex-col items-center">
          <Header2 className="text-base font-normal text-neutral-500">
            {format(date, 'EEEE')}
          </Header2>
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
          <div className="flex gap-2">
            <PathLink
              path="/day/:date"
              params={{ date: stdFormat(addDays(date, -1)) }}
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon height={20} className="" />
            </PathLink>
            <PathLink
              path="/day/:date"
              params={{ date: stdFormat(addDays(date, 1)) }}
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon height={20} className="rotate-180" />
            </PathLink>
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="flex items-center justify-center opacity-50">
              <ChevronLeftIcon height={20} className="" />
            </div>
            <div className="flex items-center justify-center opacity-50">
              <ChevronLeftIcon height={20} className="rotate-180" />
            </div>
          </div>
        )
      }
    >
      <ul className="flex min-h-[120px] flex-col gap-2">
        {events?.map((event) => (
          <li key={event.id}>
            <PathLink
              path="/day/:date"
              params={{ date: formattedDay }}
              query={{ event: event.id }}
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
        {events?.length === 0 && (
          <li className="flex flex-col items-center justify-center py-10 lg:py-20">
            <div className="text-xl">😴</div>
            <div className="italic text-neutral-500">
              Nothing on for this day
            </div>
          </li>
        )}
        {isLoading && (
          <li className="flex flex-col items-center justify-center py-10 lg:py-20">
            <div className="text-xl">
              <Loader />
            </div>
          </li>
        )}
      </ul>
      <PathLink
        path="/day/:date"
        params={{ date: formattedDay }}
        query={{ event: SEARCH_PARAMS_NEW }}
        className="flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-50"
      >
        <PlusIcon height={16} />
        <span>Add Event</span>
      </PathLink>
    </InnerPageLayout>
  )
}
