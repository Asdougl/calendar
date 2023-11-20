'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { isBefore } from 'date-fns'
import { type FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { ControlledCategorySelect } from '~/components/form/CategorySelect'
import { Field, InputField } from '~/components/ui/Field'
import { ErrorText } from '~/components/ui/Text'
import { Button } from '~/components/ui/button'
import { DateRangePicker } from '~/components/ui/dates/DateRangePicker'
import { Select } from '~/components/ui/select'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { CATEGORY_SELECT_OPTIONS } from '~/utils/classnames'

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

  const { mutate: createPeriod } = api.periods.create.useMutation({
    onSuccess: () => {
      router.push('/periods')
    },
  })

  const { mutate: updatePeriod } = api.periods.update.useMutation({
    onSuccess: () => {
      router.push('/periods')
    },
  })

  const { mutate: deletePeriod } = api.periods.delete.useMutation({
    onSuccess: () => {
      router.push('/periods')
    },
  })

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
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

  const onSubmit = handleSubmit((data) => {
    if (isBefore(data.dates.end, data.dates.start)) {
      setError('dates', { message: 'End date must be after start date' })
      return
    }

    if (period) {
      updatePeriod({
        id: period.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        categoryId: data.categoryId,
        startDate: data.dates.start,
        endDate: data.dates.end,
      })
    } else {
      createPeriod({
        name: data.name,
        color: data.color,
        icon: data.icon,
        categoryId: data.categoryId,
        startDate: data.dates.start,
        endDate: data.dates.end,
      })
    }
  })

  const onDelete = () => {
    if (period) {
      deletePeriod({ id: period.id })
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
        <Button disabled={!isDirty} type="submit">
          {period ? 'Update' : 'Create'}
        </Button>
        {period && (
          <Button intent="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
