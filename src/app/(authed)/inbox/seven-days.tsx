'use client'

import { endOfWeek, getDay, startOfDay } from 'date-fns'
import { useState, type FC } from 'react'
import { UserGroupIcon, UserIcon } from '@heroicons/react/24/solid'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { Header1 } from '~/components/ui/headers'
import { createClientDateRangeHook } from '~/utils/hooks'
import { SevenDays } from '~/components/seven-days/SevenDays'
import { createPeriodsByDaySorter, eventsByDay } from '~/utils/sort'
import { RefreshIcon } from '~/components/RefreshIcon'

const useClientDate = createClientDateRangeHook({
  initialState: { start: new Date(), end: new Date() },
  processor: (date) => {
    return {
      start: startOfDay(date),
      end: endOfWeek(date, { weekStartsOn: getDay(date) }),
    }
  },
})

export const NextSevenDays: FC = () => {
  const [focusDate, focusMounted] = useClientDate()
  const [showShared, setShowShared] = useState(true)

  const queryClient = api.useUtils()

  const {
    data: events,
    isLoading,
    isFetching,
  } = api.event.range.useQuery(
    {
      ...focusDate,
      shared: showShared,
    },
    {
      enabled: focusMounted,
      staleTime: Duration.seconds(30),
      refetchInterval: Duration.minutes(2),
      select: eventsByDay,
    }
  )

  const { data: periods } = api.periods.range.useQuery(focusDate, {
    enabled: focusMounted,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Duration.minutes(10),
    refetchInterval: Duration.minutes(15),
    select: createPeriodsByDaySorter(focusDate.start),
  })

  const loading = isLoading

  return (
    <InnerPageLayout
      fullscreen
      headerRight={
        <RefreshIcon
          onClick={() => queryClient.event.range.invalidate()}
          loading={isFetching}
        />
      }
      title={
        <div className="relative z-10">
          <Header1 className="relative bg-neutral-950 text-2xl">Inbox</Header1>
        </div>
      }
      headerLeft={
        <button onClick={() => setShowShared(!showShared)}>
          {showShared ? (
            <UserGroupIcon height={20} />
          ) : (
            <UserIcon height={20} />
          )}
        </button>
      }
    >
      {focusDate && (
        <SevenDays
          start={focusDate.start}
          end={focusDate.end}
          events={events}
          periods={periods}
          loading={loading}
          weekStart={getDay(focusDate.start)}
          usedIn="inbox"
          outlines
        />
      )}
    </InnerPageLayout>
  )
}
