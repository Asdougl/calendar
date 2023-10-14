'use client'

import type { FC } from 'react'
import { useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery } from '@tanstack/react-query'
import { getDay, setDay, startOfDay } from 'date-fns'
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid'
import type { Database } from '@/types/typegen'
import { Header1 } from '@/components/headers'
import { time } from '@/util/dates'
import type { EventWithCategory } from '@/types/supabase'
import { EventWithCategoryQuery } from '@/types/supabase'
import { Debugger } from '@/components/Debugger'
import { DayBox } from '@/components/DayBox'

export const WeekView: FC = () => {
  const supabase = createClientComponentClient<Database>()

  const focusDate = startOfDay(new Date())

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', '7-days'],
    queryFn: async () => {
      const { data } = await supabase
        .from(EventWithCategoryQuery.from)
        .select(EventWithCategoryQuery.select)
        .gte('datetime', focusDate.toISOString())
        .lt(
          'datetime',
          setDay(focusDate, 7, {
            weekStartsOn: getDay(focusDate),
          }).toISOString()
        )
      return data || []
    },
    refetchOnWindowFocus: false,
    staleTime: time.minutes(5),
    refetchInterval: time.minutes(10),
  })

  const eventsByDay = useMemo(() => {
    if (!events?.length) return []

    const eventsByDay: EventWithCategory[][] = []

    events.forEach((event) => {
      const dayOfWeek = getDay(new Date(event.datetime))
      if (!eventsByDay[dayOfWeek]) eventsByDay[dayOfWeek] = [event]
      else eventsByDay[dayOfWeek].push(event)
    })

    return eventsByDay
  }, [events])

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
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
      <div className="grid grid-cols-2 max-h-screen h-full gap-2 px-1 pb-2">
        {/* weekend */}
        <div className="grid grid-rows-2 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={6}
            events={eventsByDay[6] || []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={0}
            events={eventsByDay[0] || []}
            isLoading={isLoading}
            startToday
          />
        </div>
        {/* weekdays */}
        <div className="grid grid-rows-5 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={5}
            events={eventsByDay[5] || []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={4}
            events={eventsByDay[4] || []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={3}
            events={eventsByDay[3] || []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={2}
            events={eventsByDay[2] || []}
            isLoading={isLoading}
            startToday
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={1}
            events={eventsByDay[1] || []}
            isLoading={isLoading}
            startToday
          />
        </div>
      </div>
    </div>
  )
}
