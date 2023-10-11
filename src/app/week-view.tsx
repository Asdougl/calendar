'use client'

import type { FC, FormEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  differenceInDays,
  format,
  getDay,
  getDayOfYear,
  getWeek,
  setDay,
  setWeek,
  startOfDay,
} from 'date-fns'
import * as Dialog from '@radix-ui/react-dialog'
import { z } from 'zod'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { EventQuery } from './queries'
import type { EventQueryResponse } from './queries'
import { cn } from '@/util/classnames'
import type { Database } from '@/types/typegen'
import { Header1, Header2 } from '@/components/headers'
import { Paragraph } from '@/components/paragraph'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Label } from '@/components/label'
import { Alert } from '@/components/Alert'
import { useDebouncedState, useMountEffect } from '@/util/hooks'
import { time } from '@/util/dates'

const DayBox: FC<{
  focusDate: Date
  dayOfWeek: number
  events: NonNullable<EventQueryResponse>
  isLoading?: boolean
  onCreate: ({
    title,
    datetime,
  }: {
    title: string
    datetime: Date
  }) => Promise<void>
}> = ({ focusDate, dayOfWeek, events, isLoading, onCreate }) => {
  const [dialogOpen, setDialogOpen] = useState(false)

  const day = useMemo(() => {
    const todayDay = getDay(new Date())

    return startOfDay(
      setDay(focusDate, dayOfWeek, {
        weekStartsOn: todayDay,
      })
    )
  }, [focusDate, dayOfWeek])

  const distanceToToday = getDayOfYear(day) - getDayOfYear(new Date())

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const title = z.string().parse(formData.get('title'))

    onCreate({
      title,
      datetime: day,
    })

    setDialogOpen(false)
    e.currentTarget.reset()
  }

  return (
    <div
      className={cn(
        'border flex-grow rounded-lg px-2 py-1 border-neutral-800',
        {
          'border-neutral-400': distanceToToday === 0,
          'border-neutral-500': distanceToToday === 1,
          'border-neutral-600': distanceToToday === 2,
        }
      )}
    >
      <div className="flex justify-between">
        <div className="flex gap-1 items-baseline">
          <div className="font-bold">{format(day, 'E')}</div>
          <div className="text-sm">{format(day, 'd MMM')}</div>
        </div>
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Trigger disabled={isLoading}>
            <PlusIcon height={20} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 md:top-64 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black rounded-lg z-10 p-6 max-w-md w-full border border-neutral-800">
              <Dialog.Title asChild>
                <Header2>Add Event</Header2>
              </Dialog.Title>
              <Dialog.Description asChild>
                <Paragraph>Create an event for {format(day, 'E d')}</Paragraph>
              </Dialog.Description>
              <form
                onSubmit={onSubmit}
                className="flex flex-col items-start gap-4"
              >
                <div className="flex flex-col gap-1 w-full">
                  <Label htmlFor="event-name">Event name</Label>
                  <Input
                    className="w-full"
                    id="event-name"
                    name="title"
                    type="text"
                  />
                </div>
                <div className="w-full flex justify-end">
                  <Button intent="primary" type="submit" disabled={isLoading}>
                    Create
                  </Button>
                </div>
              </form>
              <Dialog.Close asChild>
                <button
                  className="absolute top-0 right-0 px-4 py-2"
                  aria-label="close"
                >
                  <XMarkIcon height={20} />
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <ul className="py-1 flex flex-col gap-1">
        {isLoading ? (
          <li className="rounded-full w-3/4 bg-neutral-900 my-2 animate-pulse h-4"></li>
        ) : (
          events.map((event) => (
            <li
              key={event.id}
              className="text-neutral-200 text-sm bg-neutral-900 rounded px-2"
            >
              {event.title}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export const WeekView: FC<{ initialData: NonNullable<EventQueryResponse> }> = ({
  initialData,
}) => {
  const supabase = createClientComponentClient<Database>()
  const queryClient = useQueryClient()

  const today = useRef(startOfDay(new Date()))
  const [focusWeek, setFocusWeek, focusWeekReady, rawFocusWeek] =
    useDebouncedState(getWeek(new Date()), 200)
  const focusDate = startOfDay(setWeek(today.current, focusWeek))

  useMountEffect(() => {
    queryClient.setQueryData(['events', focusDate.toISOString()], initialData)
  })

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', focusDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from(EventQuery.from)
        .select(EventQuery.select)
        .gte('datetime', focusDate.toISOString())
        .lt(
          'datetime',
          setDay(focusDate, 7, {
            weekStartsOn: getDay(today.current),
          }).toISOString()
        )
      return data || []
    },
    refetchOnWindowFocus: false,
    staleTime: time.minutes(5),
    refetchInterval: time.minutes(10),
    enabled: focusWeekReady,
  })

  const loading = isLoading || !focusWeekReady

  const { mutateAsync, error } = useMutation({
    mutationFn: async ({
      title,
      datetime,
    }: {
      title: string
      datetime: Date
    }) => {
      await supabase
        .from(EventQuery.from)
        .insert([{ title, datetime: datetime.toISOString() }])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  const eventsByDay = useMemo(() => {
    if (!events?.length) return []

    const eventsByDay: NonNullable<EventQueryResponse>[number][][] = []

    events.forEach((event) => {
      const dayOfWeek = getDay(new Date(event.datetime))
      if (!eventsByDay[dayOfWeek]) eventsByDay[dayOfWeek] = [event]
      else eventsByDay[dayOfWeek].push(event)
    })

    return eventsByDay
  }, [events])

  const nextWeek = () => {
    setFocusWeek((prev) => prev + 1)
  }

  const prevWeek = () => {
    setFocusWeek((prev) => prev - 1)
  }

  const weekLabel = useMemo(() => {
    const focusDate = setWeek(today.current, rawFocusWeek)
    const weeksFromNow = differenceInDays(focusDate, today.current) / 7

    if (weeksFromNow === 0) return 'This Week'
    if (weeksFromNow === 1) return 'Next Week'
    if (weeksFromNow === -1) return 'Last Week'
    if (weeksFromNow > 0) return `In ${weeksFromNow} Weeks`
    if (weeksFromNow < 0) return `${Math.abs(weeksFromNow)} Weeks Ago`
  }, [rawFocusWeek])

  return (
    <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
      <header className="flex items-center justify-between px-4 py-6">
        <button onClick={prevWeek} className="h-full px-4">
          <ArrowLeftIcon height={20} />
        </button>
        <Header1 className="text-2xl">{weekLabel}</Header1>
        <button onClick={nextWeek} className="h-full px-4">
          <ArrowRightIcon height={20} />
        </button>
      </header>
      {error && (
        <Alert
          title="An Error has occurred"
          level="error"
          message={error.message}
        />
      )}
      <div className="grid grid-cols-2 max-h-screen h-full gap-2 px-1 pb-2">
        {/* weekend */}
        <div className="grid grid-rows-2 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={6}
            events={eventsByDay[6] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={0}
            events={eventsByDay[0] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
        </div>
        {/* weekdays */}
        <div className="grid grid-rows-5 gap-2">
          <DayBox
            focusDate={focusDate}
            dayOfWeek={5}
            events={eventsByDay[5] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={4}
            events={eventsByDay[4] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={3}
            events={eventsByDay[3] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={2}
            events={eventsByDay[2] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
          <DayBox
            focusDate={focusDate}
            dayOfWeek={1}
            events={eventsByDay[1] || []}
            onCreate={mutateAsync}
            isLoading={loading}
          />
        </div>
      </div>
    </div>
  )
}
