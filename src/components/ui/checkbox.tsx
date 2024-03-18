import { CheckIcon } from '@heroicons/react/24/outline'
import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { type ForwardedRef, forwardRef } from 'react'
import { cn } from '~/utils/classnames'

type CheckboxProps = RadixCheckbox.CheckboxIndicatorProps

const CheckboxRaw = (
  {
    onCheckedChange,
    checked,
    ...props
  }: CheckboxProps &
    Pick<
      RadixCheckbox.CheckboxProps,
      'onCheckedChange' | 'checked' | 'disabled'
    >,
  ref: ForwardedRef<HTMLInputElement>
) => {
  return (
    <RadixCheckbox.Root
      onCheckedChange={onCheckedChange}
      checked={checked}
      disabled={props.disabled}
      className={cn(
        'flex h-6 w-6 shrink-0 grow-0 items-center justify-center rounded-lg border hover:bg-neutral-900',
        checked ? 'border-neutral-400' : 'border-neutral-600'
      )}
    >
      <RadixCheckbox.Indicator {...props} ref={ref}>
        <CheckIcon height={18} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  )
}

export const Checkbox = forwardRef(CheckboxRaw)
