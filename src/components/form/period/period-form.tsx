import { zodResolver } from '@hookform/resolvers/zod'
import { endOfDay, startOfDay } from 'date-fns'
import { type ReactNode, type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { CategorySelect } from '../CategorySelect'
import { DeleteButton } from '../DeleteButton'
import { DateRangePicker } from '~/components/ui/dates/DateRangePicker'
import { Input } from '~/components/ui/input'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { CATEGORY_SELECT_OPTIONS, cn } from '~/utils/classnames'
import { formatError } from '~/utils/errors'
import { Alert } from '~/components/ui/Alert'
import { FormSubmitButton } from '~/components/ui/form-button'
import { Select } from '~/components/ui/select'

const PeriodFormValidation = z.object({
  name: z.string().min(1, 'A name is required for your period'),
  color: z.string().min(1, 'A color is required for your period'),
  icon: z.string().min(1, 'An icon is required for your period'),
  dates: z.object({
    start: z.date(),
    end: z.date(),
  }),
  categoryId: z.string().nullable(),
})
type PeriodFormValidation = z.infer<typeof PeriodFormValidation>

type EditPeriodFormProps = {
  period: RouterOutputs['periods']['range'][number]
}

type CreatePeriodFormProps = {
  startDate: Date
  endDate?: Date
}

type PeriodFormProps = {
  onSubmit?: (periodStartDate: Date) => void
  labels?: boolean
  wipValues?: Partial<PeriodFormValidation>
  extraActions?: ReactNode
} & (EditPeriodFormProps | CreatePeriodFormProps)

export const PeriodForm: FC<PeriodFormProps> = ({
  onSubmit: onFinish,
  labels,
  wipValues,
  extraActions,
  ...props
}) => {
  const isEdit = 'period' in props

  const queryClient = api.useUtils()

  const {
    handleSubmit,
    register,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PeriodFormValidation>({
    resolver: zodResolver(PeriodFormValidation),
    defaultValues: isEdit
      ? {
          name: props.period.name,
          color: props.period.color,
          icon: props.period.icon,
          categoryId: props.period.category?.id,
          dates: {
            start: props.period.startDate,
            end: props.period.endDate,
          },
          ...wipValues,
        }
      : {
          color: '_none',
          dates: {
            start: props.startDate,
            end: props.endDate,
          },
          ...wipValues,
        },
  })

  const mutationOptions = {
    onSuccess: () => {
      queryClient.event
        .invalidate()
        .catch((err) => setError('root', { message: formatError(err) }))
    },
    onError: (error: unknown) => {
      setError('root', { message: formatError(error) })
    },
  }

  const { mutateAsync: updateMutateAsync } =
    api.periods.update.useMutation(mutationOptions)

  const { mutateAsync: createMutateAsync } =
    api.periods.create.useMutation(mutationOptions)

  const { mutate: deleteMutate, isPending: isDeleting } =
    api.periods.delete.useMutation(mutationOptions)

  const onSubmit = handleSubmit(async (data) => {
    const start = startOfDay(data.dates.start)
    const end = endOfDay(data.dates.end)

    if (start > end) {
      setError('dates', { message: 'End date must be after start date' })
      return
    }

    const payload = {
      name: data.name,
      color: data.color,
      icon: data.icon,
      categoryId: data.categoryId || null,
      startDate: start,
      endDate: end,
    }

    try {
      if (isEdit) {
        await updateMutateAsync({
          id: props.period.id,
          ...payload,
        })
      } else {
        await createMutateAsync(payload)
      }
    } catch (error) {
      setError('root', {
        message: formatError(error),
      })
    }

    onFinish?.(payload.startDate)
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col items-start gap-4">
      {/* Row 1 -- name */}
      <div className="flex w-full flex-col gap-1">
        <label htmlFor="name" className={cn({ 'sr-only': !labels })}>
          Name
        </label>
        <Input
          id="name"
          placeholder="Period Name"
          autoComplete="off"
          className="min-w-full flex-grow"
          error={!!errors.name}
          disabled={isSubmitting}
          {...register('name')}
        />
      </div>
      {/* Row 2 -- Date + Category */}
      <div
        className={cn('flex w-full flex-col gap-4', { 'lg:flex-row': !labels })}
      >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="dates" className={cn({ 'sr-only': !labels })}>
            Dates
          </label>
          <Controller
            control={control}
            name="dates"
            render={({ field }) => (
              <DateRangePicker
                id="new-period-start-date"
                start={field.value.start}
                end={field.value.end}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="categoryId" className={cn({ 'sr-only': !labels })}>
            Category
          </label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field, formState }) => (
              <CategorySelect
                id="categoryId"
                value={field.value}
                disabled={formState.isSubmitting}
                onChange={field.onChange}
                className="flex-1"
                width="full"
              />
            )}
          />
        </div>
      </div>
      {/* Row 3 -- Color + Icon */}
      <div
        className={cn('flex w-full flex-col gap-4', { 'lg:flex-row': !labels })}
      >
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="color" className={cn({ 'sr-only': !labels })}>
            Color
          </label>
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <Select
                options={CATEGORY_SELECT_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="icon" className={cn({ 'sr-only': !labels })}>
            Icon
          </label>
          <Input
            id="icon"
            placeholder="Icon"
            autoComplete="off"
            className="min-w-full flex-grow"
            error={!!errors.icon}
            disabled={isSubmitting}
            {...register('icon')}
          />
        </div>
      </div>

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
          {isEdit && (
            <DeleteButton
              isDeleting={isDeleting}
              onDelete={() => deleteMutate({ id: props.period.id })}
              title={`Delete ${props.period.name}`}
              body="Are you sure you want to delete this event? This action cannot be undone."
            >
              Delete
            </DeleteButton>
          )}
          <FormSubmitButton
            control={control}
            intent="primary"
            type="submit"
            className="px-8"
          >
            Save
          </FormSubmitButton>
        </div>
      </div>
    </form>
  )
}
