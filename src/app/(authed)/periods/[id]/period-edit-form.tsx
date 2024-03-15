'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { differenceInDays, endOfDay, startOfDay } from 'date-fns'
import { createPeriod, confirmDeletePeriod, updatePeriod } from './actions'
import { ControlledCategorySelect } from '~/components/form/CategorySelect'
import { Field, InputField } from '~/components/ui/Field'
import { ErrorText } from '~/components/ui/Text'
import { SubmitButton } from '~/components/ui/button'
import { DateRangePicker } from '~/components/ui/dates/DateRangePicker'
import { Select } from '~/components/ui/select'
import { type RouterOutputs } from '~/trpc/shared'
import { CATEGORY_SELECT_OPTIONS } from '~/utils/classnames'
import { isError, isString } from '~/utils/guards'
import { DeleteButton } from '~/components/form/DeleteButton'
import { api } from '~/trpc/react'

const PeriodForm = z.object({
  name: z.string().min(1, 'A name is required for your period'),
  color: z.string().min(1, 'A color is required for your period'),
  icon: z.string().min(1, 'An icon is required for your period'),
  dates: z.object({
    start: z.date(),
    end: z.date(),
  }),
  categoryId: z.string().nullish(),
})
type PeriodForm = z.infer<typeof PeriodForm>

type PeriodEditFormProps = {
  period: RouterOutputs['periods']['one']
  origin: string
}

export const PeriodEditForm: FC<PeriodEditFormProps> = ({ period, origin }) => {
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PeriodForm>({
    resolver: zodResolver(PeriodForm),
    defaultValues: period
      ? {
          name: period.name,
          color: period.color,
          icon: period.icon,
          categoryId: period.categoryId,
          dates: {
            start: period.startDate,
            end: period.endDate,
          },
        }
      : {
          color: '_none',
          dates: {},
        },
  })

  const onSubmit = handleSubmit(async (data) => {
    const start = startOfDay(data.dates.start)
    const end = endOfDay(data.dates.end)

    if (start > end) {
      setError('dates', { message: 'End date must be after start date' })
      return
    }

    try {
      if (period) {
        await updatePeriod(period.id, {
          name: data.name,
          color: data.color,
          icon: data.icon,
          categoryId: data.categoryId,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
        router.push(origin)
      } else {
        await createPeriod({
          name: data.name,
          color: data.color,
          icon: data.icon,
          categoryId: data.categoryId || null,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        })
        router.push(origin)
      }
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

  const { mutateAsync: deletePeriod, isLoading: isDeleting } =
    api.periods.delete.useMutation({
      onSuccess: async (data) => {
        await confirmDeletePeriod(data.id)
        router.push(origin)
      },
    })

  const dates = watch('dates')
  const periodDuration = differenceInDays(dates.end, dates.start) + 1

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 px-2">
      <InputField
        label="Name"
        {...register('name')}
        error={errors.name?.message}
        autoComplete="off"
      />
      <Field label="Color" error={errors.color?.message}>
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
      </Field>
      <InputField
        label="Icon"
        {...register('icon')}
        error={errors.icon?.message}
      />
      <Field
        label="Category"
        id="new-period-category-id"
        error={errors.categoryId?.message}
      >
        <ControlledCategorySelect
          id="new-period-category-id"
          control={control}
          name="categoryId"
        />
      </Field>
      <Field
        label="Dates"
        id="new-period-dates"
        error={errors.dates?.message}
        subtext={!isNaN(periodDuration) ? `${periodDuration} days` : undefined}
      >
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
      </Field>
      {errors.root && <ErrorText>{errors.root.message}</ErrorText>}
      <div className="flex gap-4">
        <SubmitButton loading={isSubmitting} disabled={!isDirty} type="submit">
          {period ? 'Update' : 'Create'}
        </SubmitButton>
        {period && (
          <DeleteButton
            onDelete={() => deletePeriod({ id: period.id })}
            isDeleting={isDeleting}
            title={`Delete ${period.name}`}
            body="Are you sure you want to delete this period? This action cannot be undone."
            buttonText="Delete Period"
          >
            Delete
          </DeleteButton>
        )}
      </div>
    </form>
  )
}
