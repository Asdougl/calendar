'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { api } from '~/trpc/server'

const CreateParams = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  icon: z.string().min(1),
  categoryId: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
})
type CreateParams = z.infer<typeof CreateParams>

export const createPeriod = async (period: CreateParams) => {
  const parsed = CreateParams.parse(period)

  await api.periods.create.mutate({
    ...parsed,
    startDate: new Date(parsed.startDate),
    endDate: new Date(parsed.endDate),
  })

  revalidatePath('/periods')
}

const UpdateParams = CreateParams.partial()
type UpdateParams = z.infer<typeof UpdateParams>

export const updatePeriod = async (id: string, period: UpdateParams) => {
  const { startDate, endDate, ...parsed } = UpdateParams.parse(period)

  await api.periods.update.mutate({
    id,
    ...parsed,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  })

  revalidatePath('/periods')
  revalidatePath(`/periods/${id}`)
}

export const confirmDeletePeriod = async (id: string) => {
  await Promise.all([
    revalidatePath('/periods'),
    revalidatePath(`/periods/${id}`),
  ])
}
