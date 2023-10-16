'use client'

import type { FC } from 'react'
import { useMemo } from 'react'
import getDay from 'date-fns/getDay'
import setDay from 'date-fns/setDay'
import startOfDay from 'date-fns/startOfDay'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import { Header1 } from '~/components/ui/headers'
import { time } from '~/utils/dates'
import { Debugger } from '~/components/Debugger'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'

export const WeekView: FC = () => {
  const focusDate = startOfDay(new Date())

  const { data: events, isLoading } = api.event.range.useQuery(
    {
      start: focusDate,
      end: setDay(focusDate, 7, {
        weekStartsOn: getDay(focusDate),
      }),
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
      const dayOfWeek = getDay(new Date(event.datetime))
      const thisDay = eventsByDay[dayOfWeek]
      if (thisDay) thisDay?.push(event)
      else eventsByDay[dayOfWeek] = [event]
    })

    return eventsByDay
  }, [events])

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8">
          <Debugger />
        </div>
        <Header1 className="text-2xl">Inbox</Header1>
        <div className="w-8">
          <button>
            <EllipsisVerticalIcon height={20} />
          </button>
        </div>
      </header>
      <div className="grid h-full max-h-screen grid-cols-2 gap-2 px-1 pb-2">
        {/* weekend */}
        <div className="grid grid-rows-2 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={6}
            events={eventsByDay[6] ?? []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={0}
            events={eventsByDay[0] ?? []}
            isLoading={isLoading}
            startToday
          />
        </div>
        {/* weekdays */}
        <div className="grid grid-rows-5 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={5}
            events={eventsByDay[5] ?? []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={4}
            events={eventsByDay[4] ?? []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={3}
            events={eventsByDay[3] ?? []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={2}
            events={eventsByDay[2] ?? []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={1}
            events={eventsByDay[1] ?? []}
            isLoading={isLoading}
            startToday
          />
        </div>
      </div>
    </div>
  )
}
