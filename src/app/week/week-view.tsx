'use client'

import type { FC } from 'react'
import { useMemo, useState } from 'react'
import {
  addWeeks,
  endOfWeek,
  format,
  getDay,
  getWeek,
  setWeek,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Header1 } from '~/components/ui/headers'
import { time, toCalendarDate } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'

export const WeekView = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const startParam = searchParams.get('start')

  const focusDate = setWeek(
    startOfWeek(startOfDay(new Date()), {
      weekStartsOn: 1,
    }),
    getWeek(startParam ? new Date(startParam) : new Date())
  )

  const { data: events, isLoading } = api.event.range.useQuery(
    {
      start: toCalendarDate(focusDate),
      end: toCalendarDate(
        endOfWeek(focusDate, {
          weekStartsOn: 1,
        })
      ),
    },
    {
      refetchOnWindowFocus: false,
      staleTime: time.minutes(5),
      refetchInterval: time.minutes(10),
    }
  )

  const eventsByDay = useMemo(() => {
    if (!events?.length) return []

    const eventsByDay: NonNullable<RouterOutputs['event']['range']>[] = []

    events.forEach((event) => {
      const dayOfWeek = getDay(new Date(event.date))
      const thisDay = eventsByDay[dayOfWeek]
      if (thisDay) thisDay?.push(event)
      else eventsByDay[dayOfWeek] = [event]
    })

    return eventsByDay
  }, [events])

  const nextWeek = () => {
    const params = new URLSearchParams(searchParams)
    params.set('start', format(addWeeks(focusDate, 1), 'yyyy-MM-dd'))
    router.push(`${pathname}?${params.toString()}`)
  }

  const prevWeek = () => {
    const params = new URLSearchParams(searchParams)
    params.set('start', format(subWeeks(focusDate, 1), 'yyyy-MM-dd'))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8">
          <button onClick={prevWeek}>
            <ArrowLeftIcon height={20} />
          </button>
        </div>
        <Header1 className="text-2xl">
          Week of {format(focusDate, 'MMM d')}
        </Header1>
        <div className="w-8">
          <button onClick={nextWeek}>
            <ArrowRightIcon height={20} />
          </button>
        </div>
      </header>
      <div className="grid h-full max-h-screen grid-cols-2 gap-2 px-1 pb-2">
        {/* weekend */}
        <div className="grid grid-rows-2 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={6}
            events={eventsByDay[6] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={0}
            events={eventsByDay[0] || []}
            isLoading={isLoading}
          />
        </div>
        {/* weekdays */}
        <div className="grid grid-rows-5 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={5}
            events={eventsByDay[5] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={4}
            events={eventsByDay[4] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={3}
            events={eventsByDay[3] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={2}
            events={eventsByDay[2] || []}
            isLoading={isLoading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={1}
            events={eventsByDay[1] || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
