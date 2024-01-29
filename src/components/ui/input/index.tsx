import { forwardRef, type ComponentProps } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { cn } from '~/utils/classnames'

const inputStyle = cva(
  'border border-neutral-800 bg-neutral-950 text-neutral-50 px-3 py-2 rounded-md focus:outline-none focus:ring ring-neutral-400 w-full placeholder:text-neutral-700 disabled:text-neutral-600',
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
      width: {
        sm: 'w-32',
        md: 'w-full md:w-48',
        lg: 'w-full lg:w-64',
        full: 'w-full',
        auto: 'w-auto',
      },
      error: {
        true: 'ring-red-300 border-red-900',
      },
      skeleton: {
        true: 'animate-pulse bg-neutral-900',
      },
      warning: {
        true: 'ring-yellow-300 border-yellow-900',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'lg',
      error: false,
      warning: false,
    },
  }
)
export type InputVariantProps = VariantProps<typeof inputStyle>

export type InputProps = Omit<ComponentProps<'input'>, 'ref'> &
  InputVariantProps

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function InputWithRef(
    { className, error, warning, disabled, ...props },
    ref
  ) {
    return (
      <input
        className={cn(inputStyle({ ...props, error, warning }), className)}
        disabled={props.skeleton || disabled}
        {...props}
        ref={ref}
      />
    )
  }
)
