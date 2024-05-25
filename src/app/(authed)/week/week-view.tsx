'use client'

import {
  ChevronLeftIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/solid'
import { addWeeks, endOfWeek, startOfWeek } from 'date-fns'
import { useState } from 'react'
import { SevenDays } from '~/components/seven-days/SevenDays'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/utils/nav/Link'
import { stdFormat } from '~/components/ui/dates/common'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { createClientDateRangeHook } from '~/utils/hooks'
import { createPeriodsByDaySorter, eventsByDay } from '~/utils/sort'

const weekFormat = new Intl.DateTimeFormat('default', {
  month: 'short',
  day: 'numeric',
})

const useWeekDate = createClientDateRangeHook({
  param: 'of',
  initialState: {
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  },
  processor: (date) => {
    return {
      start: startOfWeek(date, { weekStartsOn: 1 }),
      end: endOfWeek(date, { weekStartsOn: 1 }),
    }
  },
})

export const WeekView = () => {
  const [focusWeek, focusMounted, , week] = useWeekDate()
  const [showShared, setShowShared] = useState(true)

  const { data: events, isLoading } = api.event.range.useQuery(
    {
      ...focusWeek,
      shared: showShared,
    },
    {
      enabled: focusMounted,
      refetchOnWindowFocus: false,
      staleTime: Duration.minutes(5),
      refetchInterval: Duration.minutes(10),
      select: eventsByDay,
    }
  )

  const { data: periods } = api.periods.range.useQuery(focusWeek, {
    enabled: focusMounted,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Duration.minutes(10),
    refetchInterval: Duration.minutes(15),
    select: createPeriodsByDaySorter(focusWeek.start),
  })

  return (
    <InnerPageLayout
      fullscreen
      headerLeft={
        <button onClick={() => setShowShared(!showShared)}>
          {showShared ? (
            <UserGroupIcon height={20} />
          ) : (
            <UserIcon height={20} />
          )}
        </button>
      }
      headerRight={
        <div className="flex gap-2">
          <PathLink
            path="/week"
            query={{ of: stdFormat(addWeeks(focusWeek.start, -1)) }}
            className="flex items-center justify-center"
          >
            <ChevronLeftIcon height={20} className="" />
          </PathLink>
          <PathLink
            path="/week"
            query={{ of: stdFormat(addWeeks(focusWeek.start, 1)) }}
            className="flex items-center justify-center"
          >
            <ChevronLeftIcon height={20} className="rotate-180" />
          </PathLink>
        </div>
      }
      title={
        focusMounted
          ? `Week of ${weekFormat.format(focusWeek.start)}`
          : 'Loading...'
      }
    >
      {focusMounted && (
        <SevenDays
          start={focusWeek.start}
          end={focusWeek.end}
          events={events}
          loading={isLoading}
          periods={periods}
          outlines={true}
          usedIn="week"
          week={week || undefined}
        />
      )}
    </InnerPageLayout>
  )
}
