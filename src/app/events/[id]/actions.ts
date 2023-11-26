'use server'

import { TimeStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { api } from '~/trpc/server'

const CreateParams = z.object({
  title: z.string().min(1),
  datetime: z.string(),
  categoryId: z.string().optional(),
  timeStatus: z.nativeEnum(TimeStatus),
  location: z.string().nullish(),
})
type CreateParams = z.infer<typeof CreateParams>

export const createEvent = async (event: CreateParams) => {
  const parsed = CreateParams.parse(event)

  await api.event.create.mutate({
    ...parsed,
    datetime: new Date(parsed.datetime),
  })

  revalidatePath('/events')
}

const UpdateParams = CreateParams.extend({
  categoryId: z.string().nullable(),
}).partial()
type UpdateParams = z.infer<typeof UpdateParams>

export const updateEvent = async (id: string, event: UpdateParams) => {
  const { datetime, ...parsed } = UpdateParams.parse(event)

  await api.event.update.mutate({
    id,
    ...parsed,
    datetime: datetime ? new Date(datetime) : undefined,
  })

  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
}

export const confirmDeleteEvent = async (id: string) => {
  await Promise.all([
    revalidatePath('/events'),
    revalidatePath(`/events/${id}`),
  ])
}
