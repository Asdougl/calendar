'use client'

import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useQuery } from '@tanstack/react-query'
import {
  endOfWeek,
  format,
  getDay,
  getWeek,
  setWeek,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/solid'
import type { Database } from '@/types/typegen'
import { Header1 } from '@/components/headers'
import { time } from '@/util/dates'
import type { EventWithCategory } from '@/types/supabase'
import { EventWithCategoryQuery } from '@/types/supabase'
import { DayBox } from '@/components/DayBox'

export const WeekView: FC = () => {
  const supabase = createClientComponentClient<Database>()

  const [focusWeek, setFocusWeek] = useState(getWeek(new Date()))

  const focusDate = setWeek(
    startOfWeek(startOfDay(new Date()), {
      weekStartsOn: 1,
    }),
    focusWeek
  )

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', 'week', focusWeek],
    queryFn: async () => {
      const { data } = await supabase
        .from(EventWithCategoryQuery.from)
        .select(EventWithCategoryQuery.select)
        .gte('datetime', focusDate.toISOString())
        .lt(
          'datetime',
          endOfWeek(focusDate, {
            weekStartsOn: 1,
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

  const nextWeek = () => {
    setFocusWeek((week) => week + 1)
  }

  const prevWeek = () => {
    setFocusWeek((week) => week - 1)
  }

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
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
      <div className="grid grid-cols-2 max-h-screen h-full gap-2 px-1 pb-2">
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
