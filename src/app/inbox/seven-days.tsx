'use client'

import { endOfWeek, getDay, startOfDay } from 'date-fns'
import { type FC } from 'react'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { Header1 } from '~/components/ui/headers'
import { useClientDate } from '~/utils/hooks'
import { SevenDays } from '~/components/SevenDays'
import { createPeriodsByDaySorter, eventsByDay } from '~/utils/sort'
import { RefreshIcon } from '~/components/RefreshIcon'

export const NextSevenDays: FC = () => {
  const [focusDate] = useClientDate()

  const queryClient = api.useUtils()

  const queryArg = focusDate
    ? {
        start: startOfDay(focusDate),
        end: endOfWeek(focusDate, { weekStartsOn: getDay(focusDate) }),
      }
    : undefined

  const { data: events, isFetching } = api.event.range.useQuery(queryArg, {
    enabled: !!focusDate,
    refetchOnWindowFocus: false,
    staleTime: Duration.minutes(5),
    refetchInterval: Duration.minutes(10),
    select: eventsByDay,
  })

  const { data: periods } = api.periods.range.useQuery(queryArg, {
    enabled: !!focusDate,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Duration.minutes(10),
    refetchInterval: Duration.minutes(15),
    select: createPeriodsByDaySorter(focusDate),
  })

  const loading = isFetching

  return (
    <InnerPageLayout
      fullscreen
      headerLeft={
        <RefreshIcon
          onClick={() => queryClient.event.range.invalidate(queryArg)}
          loading={isFetching}
        />
      }
      title={
        <div className="relative z-10">
          <Header1 className="relative bg-neutral-950 text-2xl">Inbox</Header1>
        </div>
      }
    >
      {focusDate && (
        <SevenDays
          focusDate={focusDate}
          events={events}
          periods={periods}
          loading={loading}
        />
      )}
    </InnerPageLayout>
  )
}
