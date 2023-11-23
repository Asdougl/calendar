'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { TimeStatus } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { createEvent, deleteEvent, updateEvent } from './actions'
import { ControlledCategorySelect } from '~/components/form/CategorySelect'
import { Field, InputField } from '~/components/ui/Field'
import { TimeInput } from '~/components/ui/TimeInput'
import { DatePicker } from '~/components/ui/dates/DatePicker'
import { Select } from '~/components/ui/select'
import { type RouterOutputs } from '~/trpc/shared'
import { isError, isString } from '~/utils/guards'
import { SubmitButton } from '~/components/ui/button'
import { ErrorText } from '~/components/ui/Text'

const EventForm = z.object({
  title: z.string().min(1, 'A title is required for your event'),
  date: z.string(),
  time: z.string().nullable(),
  categoryId: z.string().nullish(),
  status: z.nativeEnum(TimeStatus),
})
type EventForm = z.infer<typeof EventForm>

const statusSelectOptions = [
  { value: TimeStatus.ALL_DAY, name: 'All Day' },
  { value: TimeStatus.STANDARD, name: 'Standard' },
]

type EventFormProps = {
  event: RouterOutputs['event']['one']
  origin: string
}

export const EditEventForm: FC<EventFormProps> = ({ event }) => {
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EventForm>({
    resolver: zodResolver(EventForm),
    defaultValues: event
      ? {
          title: event.title,
          date: format(event.datetime, 'yyyy-MM-dd'),
          time:
            event.timeStatus === 'STANDARD'
              ? format(event.datetime, 'HHmm')
              : null,
          categoryId: event.category?.id,
          status: event.timeStatus,
        }
      : undefined,
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (event) {
        await updateEvent(event.id, {
          datetime: new Date(
            `${data.date}${
              data.status === 'STANDARD' ? ` ${data.time || ''}` : ''
            }`
          ).toISOString(),
          title: data.title,
          categoryId: data.categoryId,
          timeStatus: data.status,
        })
      } else {
        await createEvent({
          datetime: new Date(
            `${data.date}${
              data.status === 'STANDARD' ? ` ${data.time || ''}` : ''
            }`
          ).toISOString(),
          title: data.title,
          categoryId: data.categoryId || undefined,
          timeStatus: data.status,
        })
      }
      router.push(origin)
    } catch (error) {
      setError('root', {
        message: isError(error)
          ? error.message
          : isString(error)
          ? error
          : 'Unknown error',
      })
    }
  })

  const onDelete = async () => {
    if (event) {
      await deleteEvent(event.id)
      router.push(origin)
    }
  }

  const watchStatus = watch('status')

  return (
    <form onSubmit={onSubmit}>
      <InputField
        label="Title"
        {...register('title')}
        error={errors.title?.message}
      />
      <Field label="Date" error={errors.date?.message}>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              value={field.value ? new Date(field.value) : new Date()}
              onChange={(value) => field.onChange(format(value, 'yyyy-MM-dd'))}
            />
          )}
        />
      </Field>
      <Field label="Event Type" error={errors.status?.message}>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              options={statusSelectOptions}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>
      {watchStatus === TimeStatus.STANDARD && (
        <Field label="Time" error={errors.time?.message}>
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <TimeInput
                value={field.value || ''}
                onChange={field.onChange}
                className="w-24 flex-grow"
              />
            )}
          />
        </Field>
      )}
      <Field label="Category" error={errors.categoryId?.message}>
        <ControlledCategorySelect control={control} name="categoryId" />
      </Field>
      {errors.root && <ErrorText>{errors.root.message}</ErrorText>}
      <div className="flex items-start justify-end gap-4 lg:flex-col-reverse">
        {event && (
          <SubmitButton
            intent="danger"
            loading={isSubmitting}
            onClick={onDelete}
            type="button"
          >
            Delete Event
          </SubmitButton>
        )}
        <SubmitButton loading={isSubmitting} disabled={!isDirty} type="submit">
          {event ? 'Update Event' : 'Create Event'}
        </SubmitButton>
      </div>
    </form>
  )
}
