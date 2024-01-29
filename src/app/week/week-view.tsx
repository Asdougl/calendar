'use client'

import { ArrowLeftIcon, ChevronLeftIcon } from '@heroicons/react/24/solid'
import { addWeeks, endOfWeek, setWeek, startOfDay, startOfWeek } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SevenDays } from '~/components/SevenDays'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/components/ui/PathLink'
import { stdFormat } from '~/components/ui/dates/common'
import { api } from '~/trpc/react'
import { Duration } from '~/utils/dates'
import { useClientDate, useClientParamDate } from '~/utils/hooks'
import { createPeriodsByDaySorter, eventsByDay } from '~/utils/sort'

const weekFormat = new Intl.DateTimeFormat('default', {
  month: 'short',
  day: 'numeric',
})

export const WeekView = () => {
  const [focusDate] = useClientParamDate('start')

  const router = useRouter()

  const queryArg = focusDate
    ? {
        start: startOfWeek(focusDate, { weekStartsOn: 1 }),
        end: endOfWeek(focusDate, { weekStartsOn: 1 }),
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

  return (
    <InnerPageLayout
      fullscreen
      headerLeft={
        <button onClick={() => router.back()}>
          <ArrowLeftIcon height={20} className="" />
        </button>
      }
      headerRight={
        queryArg ? (
          <div className="flex gap-2">
            <PathLink
              path="/week"
              query={{ start: stdFormat(addWeeks(queryArg.start, -1)) }}
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon height={20} className="" />
            </PathLink>
            <PathLink
              path="/week"
              query={{ start: stdFormat(addWeeks(queryArg.start, 1)) }}
              className="flex items-center justify-center"
            >
              <ChevronLeftIcon height={20} className="rotate-180" />
            </PathLink>
          </div>
        ) : undefined
      }
      title={
        queryArg ? `Week of ${weekFormat.format(queryArg.start)}` : 'Loading...'
      }
    >
      {focusDate && (
        <SevenDays
          focusDate={focusDate}
          events={events}
          loading={isFetching}
          periods={periods}
          outlines={false}
        />
      )}
    </InnerPageLayout>
  )
}
