import {
  forwardRef,
  type ComponentProps,
  useState,
  type ChangeEvent,
} from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '~/utils/classnames'
import { exists } from '~/utils/guards'

const input = cva(
  'border border-neutral-800 bg-neutral-950 text-neutral-50 px-3 py-2 rounded-md focus:outline-none focus:ring ring-neutral-400 w-full placeholder:text-neutral-700',
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
      width: {
        sm: 'w-32',
        md: 'w-48',
        lg: 'w-64',
        full: 'w-full',
      },
      error: {
        true: 'ring-red-300 border-red-900',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'lg',
      error: false,
    },
  }
)
type InputVariantProps = VariantProps<typeof input>

export type InputProps = Omit<ComponentProps<'input'>, 'ref'> &
  InputVariantProps

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function InputWithRef({ className, error, ...props }, ref) {
    return (
      <input
        className={cn(input({ ...props, error }), className)}
        {...props}
        ref={ref}
      />
    )
  }
)

type NumberInputProps = Omit<
  InputProps,
  'ref' | 'onChange' | 'input' | 'maxLength' | 'minLength' | 'type'
> & {
  onChange: (value: number, error?: 'min' | 'max') => void
  value: number
  min?: number
  max?: number
  error?: boolean
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInputWithRef(
    { value, max, min, onChange: setExternalValue, ...props },
    ref
  ) {
    const [internalValue, setInternalValue] = useState(value.toString())

    const onInternalChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value
      const numberedValue = +value.replaceAll(/\D/g, '')

      if (isNaN(numberedValue) || value === '') {
        setInternalValue('')
        return
      } else if (exists(max) && numberedValue > max) {
        setExternalValue(max, 'max')
        setInternalValue(max.toString())
      } else if (exists(min) && numberedValue < min) {
        setExternalValue(min, 'min')
        setInternalValue(numberedValue.toString())
      } else {
        setExternalValue(numberedValue)
        setInternalValue(numberedValue.toString())
      }
    }

    return (
      <Input
        ref={ref}
        {...props}
        value={internalValue}
        onChange={onInternalChange}
      />
    )
  }
)
