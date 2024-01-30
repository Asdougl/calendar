'use client'

import { endOfWeek, getDay, startOfDay } from 'date-fns'
import { type FC } from 'react'
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { cn } from '~/utils/classnames'
import { Header1 } from '~/components/ui/headers'
import { useClientDate } from '~/utils/hooks'
import { SevenDays } from '~/components/SevenDays'
import { createPeriodsByDaySorter, eventsByDay } from '~/utils/sort'

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
        <button onClick={() => queryClient.event.range.invalidate(queryArg)}>
          <ArrowPathIcon height={20} className="" />
        </button>
      }
      title={
        <div className="relative z-10">
          <div
            className={cn(
              'absolute left-1/2 top-0 -z-10 -translate-x-1/2 rounded-full bg-neutral-950 p-1 shadow-lg transition-transform delay-200',
              isFetching ? 'translate-y-8' : 'translate-y-0'
            )}
          >
            {isFetching ? (
              <ArrowPathIcon height={20} className="animate-spin" />
            ) : (
              <CheckIcon height={20} />
            )}
          </div>
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
