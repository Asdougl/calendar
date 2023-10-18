import * as RadixSelect from '@radix-ui/react-select'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid'
import { Loader } from './Loader'
import { Button } from './button'
import { cn } from '~/utils/classnames'

type Option = {
  value: string
  name: string
}

type SelectProps = {
  defaultValue?: string
  name: string
  className?: string
  disabled?: boolean
  loading?: boolean
  options: Option[]
  defaultOption?: Option
  onChange?: (value: string) => void
}

export const Select = (props: SelectProps) => {
  return (
    <RadixSelect.Root
      defaultValue={props.defaultValue}
      name={props.name}
      onValueChange={props.onChange}
    >
      <RadixSelect.Trigger asChild>
        <Button
          disabled={props.disabled}
          className={cn(
            'flex w-full flex-grow items-center justify-between gap-1 md:w-auto',
            props.className
          )}
        >
          {props.loading ? (
            <Loader />
          ) : (
            <>
              <RadixSelect.Value
                placeholder="Category"
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
          <RadixSelect.ScrollUpButton className="RadixSelectScrollButton">
            <ChevronUpIcon height={20} />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="flex flex-col gap-1">
            {props.defaultOption && (
              <RadixSelect.Item
                value={props.defaultOption.value}
                className="relative pl-8 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
              >
                <RadixSelect.ItemText>
                  {props.defaultOption.name}
                </RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute left-0 top-1/2 -translate-y-1/2">
                  <CheckIcon height={20} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            )}
            {props.options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="relative pl-8 pr-4 text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50"
              >
                <RadixSelect.ItemText>{option.name}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="absolute left-0 top-1/2 -translate-y-1/2">
                  <CheckIcon height={20} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="RadixSelectScrollButton">
            <ChevronDownIcon />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
