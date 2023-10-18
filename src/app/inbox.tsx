'use client'

import type { FC } from 'react'
import { useMemo } from 'react'
import getDay from 'date-fns/getDay'
import setDay from 'date-fns/setDay'
import startOfDay from 'date-fns/startOfDay'
import {
  ArrowPathIcon,
  CheckIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/solid'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { z } from 'zod'
import { Header1 } from '~/components/ui/headers'
import { time } from '~/utils/dates'
import { Debugger } from '~/components/Debugger'
import { DayBox } from '~/components/DayBox'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { useLocalStorage } from '~/utils/hooks'
import { cn } from '~/utils/classnames'

const InboxSettings = z.object({
  leftWeekends: z.boolean().default(true),
})

export const Inbox: FC = () => {
  const focusDate = startOfDay(new Date())

  const queryClient = api.useContext()

  const [settings, setSettings] = useLocalStorage(
    'inbox-settings',
    InboxSettings
  )

  const {
    data: events,
    isLoading,
    isFetching,
  } = api.event.range.useQuery(
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="flex h-full w-full items-center justify-center">
              <EllipsisVerticalIcon height={20} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="right-0 rounded-lg border border-neutral-800 bg-neutral-950 py-1 shadow-lg">
                <DropdownMenu.Item asChild>
                  <button
                    className="relative flex w-full items-center py-2 pl-8 pr-4 text-sm text-neutral-50 hover:bg-neutral-800"
                    onClick={() => queryClient.event.range.invalidate()}
                  >
                    <span className="relative">
                      <ArrowPathIcon
                        width={20}
                        className="absolute right-full top-1/2 -translate-y-1/2 pr-2"
                      />
                    </span>
                    Reload
                  </button>
                </DropdownMenu.Item>
                <DropdownMenu.CheckboxItem
                  className="relative flex w-full items-center py-2 pl-8 pr-4 text-sm text-neutral-50 hover:bg-neutral-800"
                  checked={settings?.leftWeekends}
                  onCheckedChange={(value) =>
                    setSettings({ ...settings, leftWeekends: value })
                  }
                >
                  <DropdownMenu.ItemIndicator className="relative">
                    <CheckIcon
                      width={20}
                      className="absolute right-full top-1/2 -translate-y-1/2 pr-2"
                    />
                  </DropdownMenu.ItemIndicator>
                  Left Weekends
                </DropdownMenu.CheckboxItem>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>
      <div className="grid h-full max-h-screen grid-cols-2 gap-2 px-1 pb-2">
        {/* weekend */}
        <div
          className={cn(
            'grid grid-rows-2 gap-2',
            settings.leftWeekends ? 'order-none' : 'order-2'
          )}
        >
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
