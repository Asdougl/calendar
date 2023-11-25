import { type FC } from 'react'
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Select, type SelectProps } from '../ui/select'
import { api } from '~/trpc/react'
import { time } from '~/utils/dates'

type CategorySelectProps = {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  id?: string
} & Pick<SelectProps, 'className' | 'width'>

const NoCategory = {
  value: 'none',
  name: 'Uncategorized',
  color: '',
}

export const CategorySelect: FC<CategorySelectProps> = ({
  value,
  onChange,
  disabled,
  id,
  ...props
}) => {
  const { data: categoryOptions = [], isLoading: isLoadingCategories } =
    api.category.all.useQuery(undefined, {
      staleTime: time.minutes(20),
      select: (data) => {
        return [
          NoCategory,
          ...data.map((category) => ({
            value: category.id,
            name: category.name,
            color: category.color,
          })),
        ]
      },
    })

  const fullDisable = disabled || isLoadingCategories

  const onValueChange = (value: string) => {
    if (value === 'none') onChange(null)
    else onChange(value)
  }

  return (
    <Select
      {...props}
      options={categoryOptions}
      loading={isLoadingCategories}
      disabled={fullDisable}
      value={value ?? 'none'}
      onChange={onValueChange}
      id={id}
    />
  )
}

type ControlledCategorySelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>
  disabled?: boolean
  name: TName
  id?: string
}

export const ControlledCategorySelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  disabled,
  id,
}: ControlledCategorySelectProps<TFieldValues, TName>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <CategorySelect
          id={id}
          value={field.value}
          onChange={field.onChange}
          disabled={disabled}
        />
      )}
    />
  )
}
