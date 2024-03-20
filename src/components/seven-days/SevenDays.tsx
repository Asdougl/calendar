import { set } from 'date-fns'
import { type FC } from 'react'
import {
  DndContext,
  type DragEndEvent,
  useSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
} from '@dnd-kit/core'
import { DayOfWeek } from './DayOfWeek'
import { SevenDaysProvider } from './common'
import { type RouterInputs, type RouterOutputs } from '~/trpc/shared'
import { api } from '~/trpc/react'
import { warn } from '~/utils/logging'

export type SevenDaysProps = {
  start: Date
  end: Date
  events?: RouterOutputs['event']['range'][]
  periods?: RouterOutputs['periods']['range'][]
  loading?: boolean
  outlines?: boolean
  weekStart?: 0 | 1 | 6 | 3 | 2 | 4 | 5
  usedIn: 'inbox' | 'shared' | 'week'
  week?: string
}

export type SevenDaysShellProps = SevenDaysProps & {
  findEvent: (id: string) => RouterOutputs['event']['range'][number] | undefined
  updateEvent: (input: RouterInputs['event']['update']) => void
}

export const SevenDaysShell: FC<SevenDaysShellProps> = ({
  start,
  events,
  periods,
  loading,
  outlines,
  weekStart,
  findEvent,
  updateEvent,
  usedIn,
  week,
}) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over?.id) return

    const [year, month, date] = e.over.id.toString().split('-')

    if (!year || !month || !date) return

    const yearInt = parseInt(year, 10)
    const monthInt = parseInt(month, 10)
    const dateInt = parseInt(date, 10)

    if (isNaN(yearInt) || isNaN(monthInt) || isNaN(dateInt)) return

    const event = findEvent(e.active.id.toString())

    if (!event) return

    if (
      event.datetime.getFullYear() === yearInt &&
      event.datetime.getMonth() === monthInt - 1 &&
      event.datetime.getDate() === dateInt
    )
      return

    updateEvent({
      id: event.id,
      datetime: set(event.datetime, {
        year: yearInt,
        month: monthInt - 1, // 0 indexed
        date: dateInt,
      }),
    })
  }

  return (
    <SevenDaysProvider
      value={{ baseDate: start, weekStart, usedIn, week, outlines, loading }}
    >
      <div className="grid grow grid-cols-2 grid-rows-10 gap-1 overflow-hidden">
        <DndContext
          onDragEnd={onDragEnd}
          sensors={[mouseSensor, touchSensor]}
          collisionDetection={pointerWithin}
        >
          <DayOfWeek
            className="row-span-5"
            dayOfWeek={6}
            events={events}
            periods={periods}
          />
          <DayOfWeek
            className="row-span-2"
            dayOfWeek={5}
            events={events}
            periods={periods}
          />
          <DayOfWeek
            className="row-span-2"
            dayOfWeek={4}
            events={events}
            periods={periods}
          />
          <DayOfWeek
            className="row-span-2"
            dayOfWeek={3}
            events={events}
            periods={periods}
          />
          <DayOfWeek
            className="row-span-5"
            dayOfWeek={0}
            events={events}
            periods={periods}
          />
          <DayOfWeek
            className="row-span-2"
            dayOfWeek={2}
            events={events}
            periods={periods}
          />
          <DayOfWeek
            className="row-span-2"
            dayOfWeek={1}
            events={events}
            periods={periods}
          />
        </DndContext>
      </div>
    </SevenDaysProvider>
  )
}

export const SevenDays = (props: SevenDaysProps) => {
  const queryClient = api.useUtils()

  const { mutate } = api.event.update.useMutation({
    onMutate: (data) => {
      if (data.datetime) {
        const curr = queryClient.event.range.getData({
          start: props.start,
          end: props.end,
        })

        if (curr) {
          const foundEvent = curr.find((event) => event.id === data.id)

          if (foundEvent) {
            foundEvent.datetime = data.datetime

            queryClient.event.range.setData(
              { start: props.start, end: props.end },
              [...curr]
            )
          }
        }

        return { previousValue: curr }
      }
    },
    onSuccess: () => {
      queryClient.event.invalidate().catch(warn)
    },
    onError: (err, variables, context) => {
      if (context?.previousValue) {
        queryClient.event.range.setData(
          { start: props.start, end: props.end },
          context.previousValue
        )
      }
    },
  })

  const findEvent = (id: string) => {
    const events = queryClient.event.range.getData({
      start: props.start,
      end: props.end,
    })

    if (!events) return

    return events.find((event) => event.id === id)
  }

  return (
    <SevenDaysShell {...props} findEvent={findEvent} updateEvent={mutate} />
  )
}
