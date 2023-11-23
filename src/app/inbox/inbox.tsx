'use client'

import type { FC } from 'react'
import { useMemo } from 'react'
import getDay from 'date-fns/getDay'
import startOfDay from 'date-fns/startOfDay'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { addDays, endOfDay, endOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { Header1 } from '~/components/ui/headers'
import { time } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn } from '~/utils/classnames'
import { useClientNow } from '~/utils/hooks'
import { type Preferences } from '~/types/preferences'
import { InnerPageLayout } from '~/components/layout/PageLayout'

type InboxProps = {
  preferences: Preferences
}

export const Inbox: FC<InboxProps> = ({ preferences }) => {
  const [focusDate] = useClientNow({
    initialDate: startOfDay(new Date()),
    modifier: startOfDay,
  })

  const queryClient = api.useContext()

  const {
    data: events,
    isLoading,
    isFetching,
  } = api.event.range.useQuery(
    {
      start: startOfDay(focusDate),
      end: endOfDay(
        endOfWeek(focusDate, {
          weekStartsOn: getDay(focusDate),
        })
      ),
    },
    {
      refetchOnWindowFocus: false,
      staleTime: time.minutes(5),
      refetchInterval: time.minutes(10),
    }
  )

  const { data: periods } = api.periods.range.useQuery({
    start: startOfDay(focusDate),
    end: endOfDay(
      endOfWeek(focusDate, {
        weekStartsOn: getDay(focusDate),
      })
    ),
  })

  const periodsByDay = useMemo(() => {
    if (!periods?.length) return []

    const periodsByDay: NonNullable<RouterOutputs['periods']['range']>[] = []

    const daysOfFocus: Date[] = []
    for (let i = 0; i < 7; i++) {
      daysOfFocus.push(addDays(focusDate, i))
    }

    periods.forEach((period) => {
      daysOfFocus.forEach((day) => {
        if (period.startDate <= day && period.endDate >= day) {
          const thisDay = periodsByDay[getDay(day)]
          if (thisDay) thisDay?.push(period)
          else periodsByDay[getDay(day)] = [period]
        }
      })
    })

    return periodsByDay
  }, [periods, focusDate])

  const eventsByDay = useMemo(() => {
    if (!events?.length) return []

    const eventsByDay: NonNullable<RouterOutputs['event']['range']>[] = []

    events.forEach((event) => {
      const dayOfWeek = getDay(event.datetime)
      const thisDay = eventsByDay[dayOfWeek]
      if (thisDay) thisDay?.push(event)
      else eventsByDay[dayOfWeek] = [event]
    })

    return eventsByDay
  }, [events])

  return (
    <InnerPageLayout
      headerLeft={
        <motion.button
          whileHover={{ rotate: -25 }}
          whileTap={{ rotate: 25 }}
          onClick={() => queryClient.invalidate()}
        >
          <ArrowPathIcon height={20} className="" />
        </motion.button>
      }
      title={
        <div className="relative">
          <div
            className={cn(
              'absolute left-1/2 top-0 -z-10 -translate-x-1/2 rounded-full bg-neutral-950 p-1 shadow-lg transition-transform',
              isFetching ? 'translate-y-8' : 'translate-y-0'
            )}
          >
            <ArrowPathIcon height={20} className="animate-spin" />
          </div>
          <Header1 className="bg-neutral-950 text-2xl">Inbox</Header1>
        </div>
      }
    >
      <div
        className={cn('flex flex-grow gap-2 overflow-hidden', {
          'flex-row-reverse': !preferences.leftWeekends,
        })}
      >
        {/* weekend */}
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={6}
            events={eventsByDay[6] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[6] ?? []}
            origin="inbox"
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={0}
            events={eventsByDay[0] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[0] ?? []}
            origin="inbox"
          />
        </div>
        {/* weekdays */}
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={5}
            events={eventsByDay[5] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[5] ?? []}
            origin="inbox"
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={4}
            events={eventsByDay[4] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[4] ?? []}
            origin="inbox"
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={3}
            events={eventsByDay[3] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[3] ?? []}
            origin="inbox"
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={2}
            events={eventsByDay[2] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[2] ?? []}
            origin="inbox"
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={1}
            events={eventsByDay[1] ?? []}
            isLoading={isLoading}
            startToday
            periods={periodsByDay[1] ?? []}
            origin="inbox"
          />
        </div>
      </div>
    </InnerPageLayout>
  )
}
