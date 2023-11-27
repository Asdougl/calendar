import * as RadixSelect from '@radix-ui/react-select'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader } from './Loader'
import { Button } from './button'
import { cn, getCategoryColor } from '~/utils/classnames'

const selectStyle = cva(
  'flex w-full flex-grow items-center justify-between gap-1',
  {
    variants: {
      width: {
        sm: 'w-32',
        md: 'w-full lg:w-48',
        lg: 'w-full lg:w-64',
        full: 'w-full',
      },
    },
    defaultVariants: {
      width: 'lg',
    },
  }
)

type Option<Values = string> = {
  value: Values
  name: string
  color?: string
}

export type SelectOption<Values = string> = Option<Values>

export type SelectProps<Values = string> = {
  defaultValue?: string
  value?: string
  name?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  options: Option<Values>[]
  defaultOption?: Option
  placeholder?: string
  id?: string
  onChange?: (value: Values) => void
} & VariantProps<typeof selectStyle>

export const Select = <Values extends string = string>({
  className,
  defaultValue,
  value,
  name,
  onChange,
  disabled,
  loading,
  placeholder,
  defaultOption,
  options,
  id,
  ...otherProps
}: SelectProps<Values>) => {
  return (
    <RadixSelect.Root
      defaultValue={defaultValue}
      value={value}
      name={name}
      onValueChange={onChange}
    >
      <RadixSelect.Trigger asChild>
        <Button
          id={id}
          disabled={disabled}
          className={cn(selectStyle(otherProps), className)}
        >
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader />
            </div>
          ) : (
            <>
              <RadixSelect.Value
                placeholder={placeholder || <>&nbsp;</>}
                className="placeholder:opacity-75"
              />
              <RadixSelect.Icon>
                <ChevronDownIcon height={16} />
              </RadixSelect.Icon>
            </>
          )}
        </Button>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content className="relative z-10 rounded-lg border border-neutral-800 bg-neutral-950 px-1 py-2">
          <RadixSelect.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-neutral-950">
            <ChevronUpIcon height={20} />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="flex flex-col gap-1">
            {defaultOption && (
              <RadixSelect.Item
                value={defaultOption.value}
                className="relative flex items-center gap-1 py-1 pl-4 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50 hover:outline-none"
              >
                <RadixSelect.ItemText>
                  {defaultOption.name}
                </RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <CheckIcon height={16} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            )}
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="relative flex items-center gap-1 rounded-lg py-1 pl-4 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50 hover:outline-none"
              >
                <RadixSelect.ItemText asChild>
                  <div className="flex items-start gap-2">
                    {option.color !== undefined && (
                      <div
                        className={cn(
                          'mt-[7px] h-2 w-2 rounded-full',
                          getCategoryColor(option.color, 'bg')
                        )}
                      ></div>
                    )}
                    <span>{option.name}</span>
                  </div>
                </RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <CheckIcon height={16} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-neutral-950">
            <ChevronDownIcon height={20} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
