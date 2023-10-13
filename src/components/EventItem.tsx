import { useState } from 'react'
import type { FormEvent, FC } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { z } from 'zod'
import { EventDialog } from './EventDialog'
import type { EventWithCategory } from '@/types/supabase'
import type { Database } from '@/types/typegen'
import { cn, getCategoryColor } from '@/util/classnames'

const hasMeaningfulTime = (date: Date) => {
  return date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds() > 0
}

export const EventItem: FC<{ event: EventWithCategory }> = ({ event }) => {
  const supabase = createClientComponentClient<Database>()

  const [edit, setEdit] = useState(false)

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async (params: {
      title?: string
      datetime?: string
      category_id?: string | null
    }) => {
      const response = await supabase
        .from('events')
        .update(params)
        .eq('id', event.id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setEdit(false)
    },
  })

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await supabase.from('events').delete().eq('id', event.id)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setEdit(false)
    },
  })

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const title = z.string().parse(formData.get('event-name'))
    const category_id = z.string().parse(formData.get('event-category-id'))

    mutate({
      title,
      category_id: category_id === 'none' ? null : category_id,
    })
  }

  const eventDateTime = new Date(event.datetime)

  return (
    <EventDialog
      open={edit}
      setOpen={setEdit}
      event={event}
      disabled={isPending || isDeleting}
      onSubmit={onSubmit}
      onDelete={deleteEvent}
    >
      <li className="flex items-center gap-2">
        <div
          className={cn(
            'flex flex-col items-center justify-center w-8 h-8 rounded-full bg-primary-400 text-white',
            event.category
              ? getCategoryColor(event.category.color, 'bg')
              : 'bg-neutral-800'
          )}
        >
          {event.category ? event.category.icon : event.title[0]}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-semibold text-left">{event.title}</span>
          {hasMeaningfulTime(eventDateTime) && (
            <span className="text-sm text-neutral-500">
              {new Date(event.datetime).toLocaleTimeString([], {
                hour: 'numeric',
                minute: 'numeric',
              })}
            </span>
          )}
        </div>
      </li>
    </EventDialog>
  )
}
