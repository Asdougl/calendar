'use client'

import type { FC } from 'react'
import { useState } from 'react'
import getDay from 'date-fns/getDay'
import startOfDay from 'date-fns/startOfDay'
import {
  ArrowPathIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/solid'
import { addDays, addWeeks, endOfDay, endOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { Header1 } from '~/components/ui/headers'
import { time } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn } from '~/utils/classnames'
import { useClientNow, useMountEffect } from '~/utils/hooks'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { useOrigination } from '~/utils/atoms'
import { usePreferences } from '~/trpc/hooks'

type InboxProps = {
  eventId?: string
}

export const Inbox: FC<InboxProps> = ({ eventId }) => {
  const [focusDate, setFocusDate] = useClientNow({
    initialDate: startOfDay(new Date()),
    modifier: startOfDay,
  })

  const [peeking, setPeeking] = useState(false)

  const queryClient = api.useUtils()

  const { preferences } = usePreferences()

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
      refetchOnMount: false,
      staleTime: time.minutes(5),
      refetchInterval: time.minutes(10),
      select: (events) => {
        if (!events?.length) return []

        const eventsByDay: NonNullable<RouterOutputs['event']['range']>[] = []

        events.forEach((event) => {
          const dayOfWeek = getDay(event.datetime)
          const thisDay = eventsByDay[dayOfWeek]
          if (thisDay) thisDay?.push(event)
          else eventsByDay[dayOfWeek] = [event]
        })

        return eventsByDay
      },
    }
  )

  const { data: periods } = api.periods.range.useQuery(
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
      refetchOnMount: false,
      staleTime: time.minutes(10),
      refetchInterval: time.minutes(15),
      select: (periods) => {
        if (!periods?.length) return []

        const periodsByDay: NonNullable<RouterOutputs['periods']['range']>[] =
          []

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
      },
    }
  )

  const [, setOriginating] = useOrigination()

  useMountEffect(() => {
    setOriginating('inbox')
  })

  const togglePeek = () => {
    setPeeking((peeking) => !peeking)
    setFocusDate((focusDate) => addWeeks(focusDate, peeking ? -1 : 1))
  }

  return (
    <InnerPageLayout
      fullscreen
      headerLeft={
        <motion.button
          whileHover={{ rotate: -25 }}
          whileTap={{ rotate: 25 }}
          onClick={() => queryClient.event.range.invalidate()}
        >
          <ArrowPathIcon height={20} className="" />
        </motion.button>
      }
      title={
        <div className="relative">
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
          <Header1 className="relative bg-neutral-950 text-2xl">
            <div className="w-10">&nbsp;</div>
            <div className="absolute left-1/2 top-0 h-full -translate-x-1/2 overflow-hidden">
              <div
                className={cn(
                  'flex origin-top flex-col gap-px transition-transform',
                  {
                    '-translate-y-1/2': peeking,
                  }
                )}
              >
                <div className="text-center">Inbox</div>
                <div className="whitespace-nowrap">And then...</div>
              </div>
            </div>
          </Header1>
        </div>
      }
      headerRight={
        <button
          className="flex h-full w-full items-center justify-center rounded-lg hover:bg-neutral-800"
          onClick={togglePeek}
        >
          <ArrowRightIcon
            height={20}
            className={cn('transition-transform', {
              'rotate-180': peeking,
            })}
          />
        </button>
      }
    >
      <div
        className={cn('flex flex-grow gap-2 overflow-hidden', {
          'flex-row-reverse':
            preferences?.weekends === 'right' ||
            (preferences?.weekends === 'dynamic' &&
              (getDay(focusDate) === 0 || getDay(focusDate) === 6)),
        })}
      >
        {/* weekend */}
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={6}
            events={events?.[6] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[6] ?? []}
            focusEvent={eventId}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={0}
            events={events?.[0] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[0] ?? []}
            focusEvent={eventId}
          />
        </div>
        {/* weekdays */}
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={5}
            events={events?.[5] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[5] ?? []}
            focusEvent={eventId}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={4}
            events={events?.[4] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[4] ?? []}
            focusEvent={eventId}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={3}
            events={events?.[3] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[3] ?? []}
            focusEvent={eventId}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={2}
            events={events?.[2] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[2] ?? []}
            focusEvent={eventId}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={1}
            events={events?.[1] ?? []}
            isLoading={isLoading}
            startToday
            periods={periods?.[1] ?? []}
            focusEvent={eventId}
          />
        </div>
      </div>
    </InnerPageLayout>
  )
}
