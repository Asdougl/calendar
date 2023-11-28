'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { TimeStatus } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { confirmDeleteEvent, createEvent, updateEvent } from './actions'
import { ControlledCategorySelect } from '~/components/form/CategorySelect'
import { Field, InputField } from '~/components/ui/Field'
import { TimeInput } from '~/components/ui/input/time'
import { DatePicker } from '~/components/ui/dates/DatePicker'
import { Select } from '~/components/ui/select'
import { type RouterOutputs } from '~/trpc/shared'
import { isError, isString } from '~/utils/guards'
import { SubmitButton } from '~/components/ui/button'
import { ErrorText } from '~/components/ui/Text'
import { dateFromDateAndTime, timeFormat } from '~/utils/dates'
import { api } from '~/trpc/react'
import { DeleteButton } from '~/components/form/DeleteButton'
import { usePreferences } from '~/trpc/hooks'

const EventForm = z.object({
  title: z.string().min(1, 'A title is required for your event'),
  date: z.string(),
  time: z.string().nullable(),
  location: z.string().nullable(),
  categoryId: z.string().nullish(),
  status: z.nativeEnum(TimeStatus),
})
type EventForm = z.infer<typeof EventForm>

const statusSelectOptions = [
  { value: TimeStatus.ALL_DAY, name: 'All Day' },
  { value: TimeStatus.STANDARD, name: 'Scheduled' },
  { value: TimeStatus.NO_TIME, name: 'Unscheduled' },
]

type EventFormProps = {
  event: RouterOutputs['event']['one']
  origin: string
  wipValues: Partial<{
    title: string
    date: string
    time: string
    categoryId: string
    location: string
    status: TimeStatus
  }>
  initialPreferences: RouterOutputs['preferences']['getAll']
}

export const EditEventForm: FC<EventFormProps> = ({
  event,
  origin,
  wipValues,
  initialPreferences,
}) => {
  const router = useRouter()

  const queryClient = api.useUtils()

  const { preferences } = usePreferences(initialPreferences)

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
          title: wipValues.title || event.title,
          date: wipValues.date || format(event.datetime, 'yyyy-MM-dd'),
          time:
            wipValues.time || event.timeStatus === 'STANDARD'
              ? timeFormat(event.datetime, preferences)
              : null,
          categoryId: wipValues.categoryId || event.category?.id,
          status: wipValues.status || event.timeStatus,
          location: wipValues.location || event.location,
        }
      : {
          title: wipValues.title || '',
          date: wipValues.date || format(new Date(), 'yyyy-MM-dd'),
          time: wipValues.time || null,
          categoryId: wipValues.categoryId || 'none',
          status: wipValues.status || TimeStatus.STANDARD,
          location: wipValues.location || null,
        },
  })

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (data.status === 'STANDARD' && !data.time) {
        setError('time', {
          message: 'A valid time is required for scheduled events',
        })
        return
      }

      const formattedTime = data.time ? `${data.time}` : '12:00'

      if (event) {
        await updateEvent(event.id, {
          datetime: dateFromDateAndTime(data.date, formattedTime).toISOString(),
          title: data.title,
          categoryId: data.categoryId,
          location: data.location,
          timeStatus: data.status,
        })
      } else {
        await createEvent({
          datetime: dateFromDateAndTime(data.date, formattedTime).toISOString(),
          title: data.title,
          categoryId: data.categoryId || undefined,
          location: data.location,
          timeStatus: data.status,
        })
      }
      await queryClient.event.invalidate()
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

  const { mutateAsync: mutateDelete, isLoading: isDeleting } =
    api.event.delete.useMutation({
      onSuccess: async (data) => {
        await confirmDeleteEvent(data.id)
        await queryClient.event.invalidate()
        router.push(origin)
      },
    })

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
      {watchStatus !== TimeStatus.ALL_DAY && (
        <Field label="Time" error={errors.time?.message} condition="optional">
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <TimeInput
                value={field.value || ''}
                onChange={field.onChange}
                className="w-24 flex-grow"
                placeholder=""
              />
            )}
          />
        </Field>
      )}
      <InputField
        label="Location"
        {...register('location')}
        condition="optional"
      />
      <Field label="Category" error={errors.categoryId?.message}>
        <ControlledCategorySelect control={control} name="categoryId" />
      </Field>
      {errors.root && <ErrorText>{errors.root.message}</ErrorText>}
      <div className="flex items-start justify-end gap-4 lg:flex-col-reverse">
        {event && (
          <DeleteButton
            isDeleting={isDeleting}
            onDelete={async () => {
              await mutateDelete({ id: event.id })
            }}
            title={`Delete ${event.title}`}
            body="Are you sure you want to delete this event? This action cannot be undone."
          >
            Delete Event
          </DeleteButton>
        )}
        <SubmitButton loading={isSubmitting} disabled={!isDirty} type="submit">
          {event ? 'Update Event' : 'Create Event'}
        </SubmitButton>
      </div>
    </form>
  )
}
