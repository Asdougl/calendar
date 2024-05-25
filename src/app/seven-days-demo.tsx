'use client'

import { endOfWeek, getDay, set, setDay, startOfDay } from 'date-fns'
import { useState } from 'react'
import { SevenDaysShell } from '~/components/seven-days/SevenDays'
import { type RouterOutputs } from '~/trpc/shared'
import { useMountEffect } from '~/utils/hooks'
import { createTempId } from '~/utils/misc'
import { eventsByDay } from '~/utils/sort'

type Event = Omit<RouterOutputs['event']['sharedRange'][number], 'createdBy'> &
  Partial<Pick<RouterOutputs['event']['sharedRange'][number], 'createdBy'>>

const createEvent = (
  params: Pick<Event, 'title' | 'datetime'> & Partial<Omit<Event, 'id'>>
): RouterOutputs['event']['range'][number] => {
  return {
    id: createTempId(),
    category: null,
    location: '123 Fake St, Sydney',
    endDateTime: null,
    timeStatus: 'STANDARD',
    cancelled: false,
    done: null,
    recursion: null,
    createdBy: {
      id: createTempId(),
      name: 'asdougl',
      image: 'https://avatars.githubusercontent.com/u/25199427?v=4',
    },
    ...params,
  }
}

const createShowcaseData = (focus: Date): RouterOutputs['event']['range'] => {
  const weekStartsOn = getDay(focus)

  return [
    // Sunday
    createEvent({
      title: 'Dinner at parents',
      datetime: set(setDay(focus, 0, { weekStartsOn }), {
        hours: 18,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'blue',
        name: 'Family',
      },
      location: '123 Fake St, Sydney',
    }),
    createEvent({
      title: 'Go for a run',
      datetime: set(setDay(focus, 0, { weekStartsOn }), {
        hours: 10,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
    createEvent({
      title: 'Grab milk from the shops',
      datetime: set(setDay(focus, 0, { weekStartsOn }), {
        hours: 12,
        minutes: 0,
      }),
      timeStatus: 'NO_TIME',
      done: false,
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
    // Monday
    createEvent({
      title: 'Day off',
      datetime: setDay(focus, 1, { weekStartsOn }),
      timeStatus: 'ALL_DAY',
    }),
    createEvent({
      title: 'Workout',
      datetime: set(setDay(focus, 1, { weekStartsOn }), {
        hours: 18,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
    // Thursday
    createEvent({
      title: 'In the office',
      datetime: set(setDay(focus, 4, { weekStartsOn }), {
        hours: 9,
        minutes: 0,
      }),
      timeStatus: 'NO_TIME',
    }),
    createEvent({
      title: 'Workout',
      datetime: set(setDay(focus, 4, { weekStartsOn }), {
        hours: 18,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'red',
        name: 'Health',
      },
    }),
    // Friday
    createEvent({
      title: 'Get on the beers',
      datetime: set(setDay(focus, 5, { weekStartsOn }), {
        hours: 17,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'green',
        name: 'Friends',
      },
      createdBy: {
        id: createTempId(),
        name: 'asdougl',
        image: 'https://avatars.githubusercontent.com/u/25199427?v=4',
      },
    }),
    // Saturday
    createEvent({
      title: 'Go to the market',
      datetime: set(setDay(focus, 6, { weekStartsOn }), {
        hours: 9,
        minutes: 0,
      }),
    }),
    createEvent({
      title: 'Lunch with friends',
      datetime: set(setDay(focus, 6, { weekStartsOn }), {
        hours: 11,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'green',
        name: 'Friends',
      },
    }),
    createEvent({
      title: 'Dinner with in-laws',
      datetime: set(setDay(focus, 6, { weekStartsOn }), {
        hours: 20,
        minutes: 0,
      }),
      category: {
        id: createTempId(),
        color: 'blue',
        name: 'Family',
      },
    }),
  ]
}

export const DemoSevenDays = () => {
  const [demoData, setDemoData] = useState(() => {
    const dates = {
      start: startOfDay(new Date()),
      end: endOfWeek(new Date(), { weekStartsOn: getDay(new Date()) }),
    }

    return {
      dates,
      events: eventsByDay(createShowcaseData(dates.start)),
      init: false,
    }
  })

  useMountEffect(() => {
    setDemoData((prev) => {
      return {
        dates: prev.dates,
        events: eventsByDay(createShowcaseData(prev.dates.start)),
        init: true,
      }
    })
  })

  const updateEvent = (event: { id: string; datetime?: Date }) => {
    if (event.datetime) {
      setDemoData((prev) => {
        const flattened = prev.events.flat()
        const found = flattened.find((search) => search.id === event.id)
        if (!event.datetime || !found) return prev
        found.datetime = event.datetime
        const newEvents = eventsByDay(flattened)
        return {
          ...prev,
          events: newEvents,
        }
      })
    }
  }

  const findEvent = (id: string) => {
    return demoData.events.flat().find((event) => event.id === id)
  }

  return (
    <SevenDaysShell
      start={demoData.dates.start}
      end={demoData.dates.end}
      events={demoData.events}
      periods={[]}
      loading={!demoData.init}
      weekStart={getDay(demoData.dates.start)}
      updateEvent={updateEvent}
      findEvent={findEvent}
      usedIn="inbox"
    />
  )
}
