import { useDraggable } from '@dnd-kit/core'
import { CheckIcon } from '@heroicons/react/24/solid'
import { type TIME_INVERVAL, type TimeStatus } from '@prisma/client'
import { type ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { Avatar } from '../ui/avatar'
import { useQueryParams } from '~/utils/nav/hooks'
import { cmerge, cn, color } from '~/utils/classnames'
import { isEventComplete } from '~/utils/dates'

const eventItemTime = (event: { timeStatus: TimeStatus; datetime: Date }) => {
  if (event.timeStatus === 'ALL_DAY') return 'All Day'
  if (event.timeStatus === 'NO_TIME') return ''
  return format(event.datetime, 'h:mm a').toLowerCase()
}

type EventableItem = {
  category: {
    id: string
    name: string
    color: string
  } | null
  recursion: {
    id: string
    interval: TIME_INVERVAL
    intervalCount: number
    triggered: boolean
  } | null
  id: string
  done: boolean | null
  title: string
  datetime: Date
  timeStatus: TimeStatus
  location: string | null
  cancelled: boolean
  endDateTime: Date | null
  createdBy?: {
    id: string
    name: string | null
    image: string | null
  } | null
}

export const EventItem = ({ event }: { event: EventableItem }) => {
  const session = useSession()

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: event.id,
      disabled: event.createdBy
        ? event.createdBy.id !== session.data?.user?.id
        : false,
      data: event,
    })

  const [, setQueryParams] = useQueryParams()

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const navigate = () => {
    setQueryParams({
      update: {
        event: event.id,
      },
      remove: ['period'],
    })
  }

  let icon: ReactNode
  if (event.createdBy && event.createdBy.id !== session.data?.user.id) {
    icon = (
      <div className="flex items-center pr-px lg:pr-1">
        <Avatar
          size="xs"
          src={event.createdBy.image}
          name={event.createdBy.name || 'User'}
          className={cn('ring-2', color('ring')(event.category?.color))}
        />
      </div>
    )
  } else if (event.done !== null) {
    icon = (
      <div
        className={cn(
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 pr-0.5',
          color('border')(event.category?.color)
        )}
      >
        {event.done && <CheckIcon height={12} />}
      </div>
    )
  } else {
    icon = (
      <div
        className={cn(
          'h-4 w-0.5 flex-shrink-0 rounded-full xl:w-1',
          color('bg')(event.category?.color)
        )}
      ></div>
    )
  }

  return (
    <button
      onClick={navigate}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={cmerge(
        'flex flex-shrink-0 items-center justify-between rounded bg-neutral-950 text-sm hover:bg-neutral-900 lg:text-base',
        { 'pointer-events-none z-10': isDragging }
      )}
    >
      <div className="flex min-w-0 items-center gap-0.5 xl:gap-1">
        {icon}
        <span
          className={cn('truncate', {
            'text-neutral-500 line-through': isEventComplete(event),
          })}
        >
          {event.title}
        </span>
      </div>
      <div className="whitespace-nowrap text-sm text-neutral-500 xl:pr-2">
        {eventItemTime(event)}
      </div>
    </button>
  )
}
