'use client'

import type { FC } from 'react'
import { useMemo } from 'react'
import getDay from 'date-fns/getDay'
import startOfDay from 'date-fns/startOfDay'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { endOfDay, endOfWeek } from 'date-fns'
import { motion } from 'framer-motion'
import { Header1 } from '~/components/ui/headers'
import { time } from '~/utils/dates'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn } from '~/utils/classnames'
import { useClientNow } from '~/utils/hooks'
import { DisplayPicture } from '~/components/DisplayPicture'
import { PathLink } from '~/components/ui/PathLink'
import { type Preferences } from '~/types/preferences'

type InboxProps = {
  username: string
  userImage?: string | null
  preferences: Preferences
}

export const Inbox: FC<InboxProps> = ({ username, userImage, preferences }) => {
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
    <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] flex-col overflow-hidden">
      <header className="flex items-center justify-between px-4 py-6">
        <div className="w-8">
          <motion.button
            whileHover={{ rotate: -25 }}
            whileTap={{ rotate: 25 }}
            onClick={() => queryClient.invalidate()}
          >
            <ArrowPathIcon height={20} className="" />
          </motion.button>
        </div>
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
        <div className="relative w-8">
          <PathLink
            path="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent hover:border-neutral-600"
          >
            <DisplayPicture
              src={userImage}
              username={username}
              className="h-8 w-8"
            />
          </PathLink>
        </div>
      </header>
      <div
        className={cn('flex gap-2 overflow-hidden px-1 pb-2', {
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
        <div className="flex w-1/2 flex-1 flex-col gap-2 overflow-hidden">
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
