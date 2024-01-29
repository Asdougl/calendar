import { zodResolver } from '@hookform/resolvers/zod'
import { TimeStatus } from '@prisma/client'
import { useState, type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  MinusCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { isValid } from 'date-fns'
import { CategorySelect } from '../CategorySelect'
import { DatePicker } from '~/components/ui/dates/DatePicker'
import { Input } from '~/components/ui/input'
import { type RouterOutputs } from '~/trpc/shared'
import { MobileTimeInput } from '~/components/ui/input/mobile-time'
import { usePreferences } from '~/trpc/hooks'
import { Button, SubmitButton } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { Alert } from '~/components/ui/Alert'
import { dateFromDateAndTime } from '~/utils/dates'
import { formatError } from '~/utils/errors'

const UpdateEventSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().nullable(),
  type: z.nativeEnum(TimeStatus),
  categoryId: z.string().nullable(),
  location: z.string().nullish(),
})
type UpdateEventFormValues = z.infer<typeof UpdateEventSchema>

type EditEventFormProps = {
  event: RouterOutputs['event']['range'][number]
}

type CreateEventFormProps = {
  date: Date
}

type EventFormProps = {
  onSubmit?: () => void
  expanded?: boolean
} & (EditEventFormProps | CreateEventFormProps)

const formatStd = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`

const formatTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`

export const EventForm: FC<EventFormProps> = ({
  onSubmit: onFinish,
  expanded: initialExpanded = false,
  ...props
}) => {
  const { preferences } = usePreferences()
  const queryClient = api.useUtils()

  const [expanded, setExpanded] = useState(initialExpanded)

  const isUpdate = 'event' in props

  const {
    handleSubmit,
    register,
    control,
    watch,
    setValue,
    getValues,
    setError,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<UpdateEventFormValues>({
    resolver: zodResolver(UpdateEventSchema),
    values: isUpdate
      ? {
          title: props.event.title,
          date: formatStd(props.event.datetime),
          time: formatTime(props.event.datetime),
          type: props.event.timeStatus || 'STANDARD',
          categoryId: props.event.category?.id || 'none',
          location: props.event.location,
        }
      : {
          title: '',
          date: formatStd(props.date),
          time: null,
          type: 'NO_TIME',
          categoryId: 'none',
        },
  })

  const { mutateAsync: updateMutateAsync } = api.event.update.useMutation({
    onSuccess: () => {
      return queryClient.event.invalidate()
    },
    onError: (error) => {
      setError('root', { message: formatError(error) })
    },
  })

  const { mutateAsync: createMutateAsync } = api.event.create.useMutation({
    onSuccess: () => {
      return queryClient.event.invalidate()
    },
    onError: (error) => {
      setError('root', { message: formatError(error) })
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    if (data.type === 'STANDARD' && !data.time) {
      setError('time', { message: 'Time is required' })
      return
    }

    const datetime = dateFromDateAndTime(data.date, data.time)
    if (!isValid(datetime)) {
      setError('date', { message: 'Invalid date/time' })
      return
    }

    const payload = {
      title: data.title,
      datetime,
      timeStatus: data.type,
      categoryId: data.categoryId === 'none' ? null : data.categoryId,
      location: data.location,
    }

    if (isUpdate) {
      await updateMutateAsync({
        id: props.event.id,
        ...payload,
      })
    } else {
      await createMutateAsync(payload)
    }

    onFinish?.()
  })

  const timeStatus = watch('type')

  const toggleTime = () => {
    const { type, time } = getValues()

    if (type === 'STANDARD') {
      setValue('type', 'NO_TIME')
    } else {
      setValue('type', 'STANDARD')
      if (!time) {
        setValue('time', '08:00')
      }
    }
  }

  const toggleAllDay = () => {
    const { type } = getValues()

    if (type === 'ALL_DAY') {
      setValue('type', 'NO_TIME')
    } else {
      setValue('type', 'ALL_DAY')
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-4">
      {/* Row 1 -- title */}
      <div className="flex w-full">
        <Input
          id="title"
          placeholder="Event Name"
          autoComplete="off"
          className="flex-grow"
          error={!!errors.title}
          disabled={isSubmitting}
          {...register('title')}
        />
      </div>
      {/* Row 2 -- Date + Category */}
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <Controller
          control={control}
          name="date"
          render={({ field, formState }) => (
            <DatePicker
              className="flex-1"
              disabled={formState.isSubmitting}
              value={field.value ? new Date(field.value) : new Date()}
              onChange={(value) => field.onChange(formatStd(value))}
            />
          )}
        />
        <Controller
          control={control}
          name="categoryId"
          render={({ field, formState }) => (
            <CategorySelect
              value={field.value}
              disabled={formState.isSubmitting}
              onChange={field.onChange}
              className="flex-1"
            />
          )}
        />
      </div>
      {/* Row 3 -- Time */}
      <div className="flex w-full flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-row rounded-lg border border-neutral-800 bg-neutral-950 lg:flex-col">
          <button
            type="button"
            disabled={isSubmitting}
            className="flex flex-1 items-center gap-2 rounded-lg p-2 disabled:text-neutral-600 md:hover:bg-neutral-900 lg:disabled:hover:bg-transparent"
            onClick={toggleTime}
          >
            {timeStatus === 'STANDARD' ? (
              <>
                <MinusCircleIcon height={20} /> Clear Time
              </>
            ) : (
              <>
                <PlusCircleIcon height={20} /> Add Time
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="flex flex-1 items-center gap-2 rounded-lg p-2 disabled:text-neutral-600 md:hover:bg-neutral-900 lg:disabled:hover:bg-transparent"
            onClick={toggleAllDay}
          >
            {timeStatus === 'ALL_DAY' ? (
              <CheckCircleIcon height={20} />
            ) : (
              <XCircleIcon height={20} />
            )}
            All Day
          </button>
        </div>
        <Controller
          control={control}
          name="time"
          render={({ field, formState }) => (
            <MobileTimeInput
              className="flex-1"
              type={preferences?.timeFormat || '12'}
              disabled={timeStatus !== 'STANDARD' || formState.isSubmitting}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </div>
      {/* Row 4+ -- Expanded Options */}
      {expanded && (
        <div className="flex w-full">
          <Input
            id="location"
            placeholder="Location (optional)"
            autoComplete="off"
            className="disabled: flex-grow"
            disabled={isSubmitting}
            {...register('location')}
          />
        </div>
      )}

      {/* Row 4 -- Errors */}
      <div className="flex w-full flex-col gap-4">
        {Object.keys(errors).length > 0 && (
          <Alert
            level="error"
            message={Object.values(errors)
              .map((error) => error.message)
              .join(', ')}
          />
        )}
      </div>

      {/* Row 5 -- Actions */}
      <div className="flex w-full justify-end gap-4 lg:flex-row">
        {!initialExpanded && (
          <Button
            type="button"
            disabled={isSubmitting}
            className="px-8"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Less' : 'More'}
          </Button>
        )}
        <SubmitButton
          loading={isSubmitting}
          intent="primary"
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="px-8"
        >
          Save
        </SubmitButton>
      </div>
    </form>
  )
}
