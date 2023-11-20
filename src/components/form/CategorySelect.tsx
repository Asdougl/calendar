import * as Select from '@radix-ui/react-select'
import { type FC } from 'react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid'
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { Button } from '../ui/button'
import { Loader } from '../ui/Loader'
import { api } from '~/trpc/react'
import { time } from '~/utils/dates'
import { cn, getCategoryColor } from '~/utils/classnames'

type CategorySelectProps = {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  id?: string
}

export const CategorySelect: FC<CategorySelectProps> = ({
  value,
  onChange,
  disabled,
  id,
}) => {
  const { data: categories, isLoading: isLoadingCategories } =
    api.category.all.useQuery(undefined, {
      staleTime: time.minutes(20),
    })

  const fullDisable = disabled || isLoadingCategories

  const onValueChange = (value: string) => {
    if (value === 'none') onChange(null)
    else onChange(value)
  }

  return (
    <Select.Root value={value || 'none'} onValueChange={onValueChange}>
      <Select.Trigger asChild>
        <Button
          id={id}
          disabled={fullDisable}
          className="flex w-full flex-grow items-center justify-between gap-1 md:w-auto"
        >
          {isLoadingCategories ? (
            <Loader />
          ) : (
            <>
              <Select.Value
                placeholder="Category"
                className="placeholder:opacity-75"
              />
              <Select.Icon>
                <ChevronDownIcon height={16} />
              </Select.Icon>
            </>
          )}
        </Button>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="relative z-10 rounded-lg border border-neutral-800 bg-neutral-950 px-1 py-2">
          <Select.ScrollUpButton className="SelectScrollButton">
            <ChevronUpIcon height={20} />
          </Select.ScrollUpButton>
          <Select.Viewport className="flex flex-col gap-1">
            <Select.Item
              value="none"
              className="relative pl-8 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
            >
              <Select.ItemText asChild>
                <div className="flex items-start justify-start gap-1 md:gap-2">
                  <div className="mt-[7px] h-2 w-2 rounded-full bg-neutral-800"></div>
                  Uncategorised
                </div>
              </Select.ItemText>
              <Select.ItemIndicator className="absolute left-0 top-1/2 -translate-y-1/2">
                <CheckIcon height={20} />
              </Select.ItemIndicator>
            </Select.Item>
            {categories?.map((category) => (
              <Select.Item
                key={category.id}
                value={category.id}
                className="relative pl-8 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
              >
                <Select.ItemText asChild>
                  <div className="flex items-start justify-start gap-1 md:gap-2">
                    <div
                      className={cn(
                        'mt-[7px] h-2 w-2 rounded-full',
                        getCategoryColor(category.color, 'bg')
                      )}
                    ></div>
                    {category.name}
                  </div>
                </Select.ItemText>
                <Select.ItemIndicator className="absolute left-0 top-1/2 -translate-y-1/2">
                  <CheckIcon height={20} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="SelectScrollButton">
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
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
