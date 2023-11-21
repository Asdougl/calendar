'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { differenceInDays } from 'date-fns'
import { type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createPeriod, deletePeriod, updatePeriod } from './actions'
import { ControlledCategorySelect } from '~/components/form/CategorySelect'
import { Field, InputField } from '~/components/ui/Field'
import { ErrorText } from '~/components/ui/Text'
import { Button, SubmitButton } from '~/components/ui/button'
import { DateRangePicker } from '~/components/ui/dates/DateRangePicker'
import { Select } from '~/components/ui/select'
import { type RouterOutputs } from '~/trpc/shared'
import { CATEGORY_SELECT_OPTIONS } from '~/utils/classnames'
import { isError, isString } from '~/utils/guards'

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
}

export const PeriodEditForm: FC<PeriodEditFormProps> = ({ period }) => {
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    setError,
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
    if (differenceInDays(data.dates.end, data.dates.start) < 0) {
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
          startDate: data.dates.start.toISOString(),
          endDate: data.dates.end.toISOString(),
        })
        router.push('/periods')
      } else {
        await createPeriod({
          name: data.name,
          color: data.color,
          icon: data.icon,
          categoryId: data.categoryId || null,
          startDate: data.dates.start.toISOString(),
          endDate: data.dates.end.toISOString(),
        })
        router.push('/periods')
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

  const onDelete = async () => {
    if (period) {
      try {
        await deletePeriod(period.id)
        router.push('/periods')
      } catch (error) {
        setError('root', {
          message: isError(error)
            ? error.message
            : isString(error)
            ? error
            : 'Unknown error',
        })
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="px-2">
      <InputField
        label="Name"
        {...register('name')}
        error={errors.name?.message}
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
      <Field label="Dates" id="new-period-dates" error={errors.dates?.message}>
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
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
