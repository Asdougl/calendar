import * as RadixSelect from '@radix-ui/react-select'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid'
import { type VariantProps, cva } from 'class-variance-authority'
import { Loader } from './Loader'
import { Button } from './button'
import { cn } from '~/utils/classnames'

const selectStyle = cva(
  'flex w-full flex-grow items-center justify-between gap-1',
  {
    variants: {
      width: {
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64',
        full: 'w-full',
      },
    },
    defaultVariants: {
      width: 'lg',
    },
  }
)

type Option = {
  value: string
  name: string
}

type SelectProps = {
  defaultValue?: string
  name?: string
  className?: string
  disabled?: boolean
  loading?: boolean
  options: Option[]
  defaultOption?: Option
  placeholder?: string
  id?: string
  onChange?: (value: string) => void
} & VariantProps<typeof selectStyle>

export const Select = ({
  className,
  defaultValue,
  name,
  onChange,
  disabled,
  loading,
  placeholder,
  defaultOption,
  options,
  id,
  ...otherProps
}: SelectProps) => {
  return (
    <RadixSelect.Root
      defaultValue={defaultValue}
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
            <Loader />
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
                <RadixSelect.ItemText>{option.name}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <CheckIcon height={16} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-neutral-950">
            <ChevronDownIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
