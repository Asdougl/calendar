'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { TimeStatus } from '@prisma/client'
import { useState, type FC, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  PlusCircleIcon,
  XCircleIcon,
  CheckCircleIcon as CheckCircleIconOutline,
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon as XCircleIconSolid,
} from '@heroicons/react/24/solid'
import { isValid } from 'date-fns'
import { CategorySelect } from '../CategorySelect'
import { DeleteButton } from '../DeleteButton'
import { DatePicker } from '~/components/ui/dates/DatePicker'
import { Input } from '~/components/ui/input'
import { type RouterOutputs } from '~/trpc/shared'
import { MobileTimeInput } from '~/components/ui/input/mobile-time'
import { usePreferences } from '~/trpc/hooks'
import { api } from '~/trpc/react'
import { Alert } from '~/components/ui/Alert'
import { dateFromDateAndTime } from '~/utils/dates'
import { formatError } from '~/utils/errors'
import { cn } from '~/utils/classnames'
import { FormButton, FormSubmitButton } from '~/components/ui/form-button'
import { Button } from '~/components/ui/button'

const UpdateEventSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().nullable(),
  type: z.nativeEnum(TimeStatus),
  todo: z.boolean().nullable(),
  categoryId: z.string().nullable(),
  location: z.string().nullish(),
  cancelled: z.boolean().optional(),
})
type UpdateEventFormValues = z.infer<typeof UpdateEventSchema>

type EditEventFormProps = {
  event: NonNullable<RouterOutputs['event']['one']>
  onSubmit?: (
    event: Omit<NonNullable<RouterOutputs['event']['one']>, 'createdBy'>
  ) => void
}

type CreateEventFormProps = {
  date: Date
  onSubmit?: (
    event: Omit<NonNullable<RouterOutputs['event']['one']>, 'createdBy'>
  ) => void
}

type EventFormProps = {
  expanded?: boolean
  labels?: boolean
  wipValues?: Partial<UpdateEventFormValues>
  extraActions?: ReactNode
  title?: ReactNode
  readonly?: boolean
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
  labels,
  wipValues,
  extraActions,
  title,
  readonly,
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateEventFormValues>({
    resolver: zodResolver(UpdateEventSchema),
    defaultValues: isUpdate
      ? {
          title: wipValues?.title || props.event.title,
          date: wipValues?.date || formatStd(props.event.datetime),
          time: wipValues?.time || formatTime(props.event.datetime),
          type: wipValues?.type || props.event.timeStatus || 'STANDARD',
          todo: wipValues?.todo ?? props.event.done,
          categoryId:
            wipValues?.categoryId || props.event.category?.id || 'none',
          location: wipValues?.location || props.event.location,
          cancelled: wipValues?.cancelled ?? props.event.cancelled,
        }
      : {
          title: wipValues?.title || '',
          date: wipValues?.date || formatStd(props.date),
          time: wipValues?.time || null,
          type: wipValues?.type || 'NO_TIME',
          categoryId: wipValues?.categoryId || 'none',
          todo: wipValues?.todo || null,
          location: wipValues?.location,
          cancelled: wipValues?.cancelled,
        },
  })

  const { mutateAsync: updateMutateAsync } = api.event.update.useMutation({
    onSuccess: () => {
      queryClient.event
        .invalidate()
        .catch((err) => setError('root', { message: formatError(err) }))
    },
    onError: (error) => {
      setError('root', { message: formatError(error) })
    },
  })

  const { mutateAsync: createMutateAsync } = api.event.create.useMutation({
    onSuccess: () => {
      queryClient.event
        .invalidate()
        .catch((err) => setError('root', { message: formatError(err) }))
    },
    onError: (error) => {
      setError('root', { message: formatError(error) })
    },
  })

  const { mutate: deleteMutate, isPending: isDeleting } =
    api.event.delete.useMutation({
      onSuccess: (victim) => {
        queryClient.event
          .invalidate()
          .catch((err) => setError('root', { message: formatError(err) }))
        onFinish?.(victim)
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

    if (data.type === 'NO_TIME' || data.type === 'ALL_DAY') {
      datetime.setHours(12, 0, 0, 0)
    }

    const payload = {
      title: data.title,
      datetime,
      done: data.todo,
      timeStatus: data.type,
      categoryId: data.categoryId === 'none' ? null : data.categoryId,
      location: data.location,
      cancelled: data.cancelled,
    }

    if (isUpdate) {
      const event = await updateMutateAsync({
        id: props.event.id,
        ...payload,
      })
      onFinish?.(event)
    } else {
      const event = await createMutateAsync(payload)
      onFinish?.(event)
    }
  })

  const timeStatus = watch('type')

  const lockForm = readonly || isSubmitting

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-4">
      {title}
      {/* Row 1 -- title */}
      <div className={cn('flex w-full flex-col gap-1', { hidden: readonly })}>
        <label htmlFor="title" className={cn({ 'sr-only': !labels })}>
          Title
        </label>
        <Input
          id="title"
          placeholder="Event Name"
          autoComplete="off"
          className={cn('min-w-full flex-grow', {
            '!text-neutral-50': readonly,
          })}
          error={!!errors.title}
          disabled={lockForm}
          {...register('title')}
        />
      </div>
      {/* Row 2 -- Date + Category */}
      <div
        className={cn('flex w-full flex-col gap-4', { 'lg:flex-row': !labels })}
      >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="date" className={cn({ 'sr-only': !labels })}>
            Date
          </label>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <DatePicker
                id="date"
                className={cn('flex-1', { '!text-neutral-50': readonly })}
                disabled={lockForm}
                value={field.value ? new Date(field.value) : new Date()}
                onChange={(value) => field.onChange(formatStd(value))}
              />
            )}
          />
        </div>
        {!readonly && (
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="categoryId" className={cn({ 'sr-only': !labels })}>
              Category
            </label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <CategorySelect
                  id="categoryId"
                  value={field.value}
                  disabled={lockForm}
                  onChange={field.onChange}
                  className="flex-1"
                  width="full"
                />
              )}
            />
          </div>
        )}
      </div>
      {/* Row 3 -- Time */}
      <div className="flex w-full flex-col gap-1">
        <div className={cn({ 'sr-only': !labels })}>Time</div>
        <div className={cn('flex flex-col gap-4', { 'lg:flex-row': !labels })}>
          <div className="flex flex-1 flex-row rounded-lg border border-neutral-800 bg-neutral-950 lg:flex-col">
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <>
                  <button
                    type="button"
                    name="time-status"
                    disabled={lockForm}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg p-2 text-sm md:hover:bg-neutral-900 lg:justify-start lg:px-4 lg:disabled:hover:bg-transparent',
                      readonly
                        ? field.value === 'STANDARD'
                          ? 'text-neutral-50'
                          : 'text-neutral-600'
                        : 'disabled:text-neutral-600'
                    )}
                    onClick={() =>
                      field.onChange(
                        field.value === 'STANDARD' ? 'NO_TIME' : 'STANDARD'
                      )
                    }
                  >
                    {field.value === 'STANDARD' ? (
                      <>
                        <MinusCircleIcon height={20} /> Schedule
                      </>
                    ) : (
                      <>
                        <PlusCircleIcon height={20} /> Schedule
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    name="all-day"
                    disabled={lockForm}
                    className={cn(
                      'flex flex-1 items-center justify-center gap-2 rounded-lg p-2 text-sm md:hover:bg-neutral-900 lg:justify-start lg:px-4 lg:disabled:hover:bg-transparent',
                      readonly
                        ? field.value === 'ALL_DAY'
                          ? 'text-neutral-50'
                          : 'text-neutral-600'
                        : 'disabled:text-neutral-600'
                    )}
                    onClick={() =>
                      field.onChange(
                        field.value === 'ALL_DAY' ? 'NO_TIME' : 'ALL_DAY'
                      )
                    }
                  >
                    {field.value === 'ALL_DAY' ? (
                      <CheckCircleIcon height={20} />
                    ) : (
                      <XCircleIcon height={20} />
                    )}
                    All Day
                  </button>
                </>
              )}
            />
            <Controller
              control={control}
              name="todo"
              render={({ field }) => (
                <button
                  type="button"
                  name="todo"
                  disabled={lockForm}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-lg p-2 text-sm md:hover:bg-neutral-900 lg:justify-start lg:px-4 lg:disabled:hover:bg-transparent',
                    readonly
                      ? field.value !== null
                        ? 'text-neutral-50'
                        : 'text-neutral-600'
                      : 'disabled:text-neutral-600'
                  )}
                  onClick={() =>
                    field.onChange(field.value === null ? false : null)
                  }
                >
                  {field.value === null ? (
                    <>
                      <CheckCircleIconOutline
                        height={20}
                        className="flex-none"
                      />{' '}
                      Todo
                    </>
                  ) : (
                    <>
                      <XCircleIconSolid height={20} className="flex-none" />{' '}
                      Todo
                    </>
                  )}
                </button>
              )}
            />
          </div>
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <MobileTimeInput
                className={cn({
                  'flex-1': !labels,
                })}
                readonly={readonly && timeStatus === 'STANDARD'}
                type={preferences?.timeFormat || '12'}
                disabled={timeStatus !== 'STANDARD' || lockForm}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
      {/* Row 4+ -- Expanded Options */}
      {expanded && (
        <>
          <div className="flex w-full flex-col gap-1">
            <label htmlFor="location" className={cn({ 'sr-only': !labels })}>
              Location
            </label>
            <Input
              id="location"
              placeholder="Location (optional)"
              autoComplete="off"
              className="w-auto min-w-full flex-grow"
              disabled={lockForm}
              {...register('location')}
            />
          </div>
          <Controller
            control={control}
            name="cancelled"
            render={({ field }) => (
              <Button
                type="button"
                disabled={lockForm}
                onClick={() => field.onChange(!field.value)}
              >
                {field.value ? 'Un-cancel event' : 'Cancel event'}
              </Button>
            )}
          />
        </>
      )}

      {/* Row 4 -- Errors */}
      <div className="flex w-full flex-col gap-4">
        {Object.keys(errors).length > 0 && (
          <Alert
            level="error"
            title="Errors"
            message={Object.values(errors)
              .map((error) => error.message)
              .join(', ')}
          />
        )}
      </div>

      {/* Row 5 -- Actions */}
      <div className="flex w-full flex-wrap-reverse justify-end gap-4 lg:justify-between">
        <div className="flex justify-end gap-4 lg:justify-start">
          {extraActions}
        </div>
        <div className="flex justify-end gap-4">
          {expanded && isUpdate && !readonly && (
            <DeleteButton
              isDeleting={isDeleting}
              onDelete={() => deleteMutate({ id: props.event.id })}
              title={`Delete ${props.event.title}`}
              body="Are you sure you want to delete this event? This action cannot be undone."
            >
              Delete
            </DeleteButton>
          )}
          {!readonly && !initialExpanded && (
            <FormButton
              control={control}
              type="button"
              className="px-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Less' : 'More'}
            </FormButton>
          )}
          {!readonly && (
            <FormSubmitButton
              control={control}
              intent="primary"
              type="submit"
              className="px-8"
            >
              Save
            </FormSubmitButton>
          )}
        </div>
      </div>
    </form>
  )
}
