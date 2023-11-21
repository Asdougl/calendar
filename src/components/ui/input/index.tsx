import { forwardRef, type ComponentProps } from 'react'
import { type InputVariantProps, inputStyle } from './common'
import { cn } from '~/utils/classnames'

export type InputProps = Omit<ComponentProps<'input'>, 'ref'> &
  InputVariantProps

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function InputWithRef({ className, error, disabled, ...props }, ref) {
    return (
      <input
        className={cn(inputStyle({ ...props, error }), className)}
        disabled={props.skeleton || disabled}
        {...props}
        ref={ref}
      />
    )
  }
)
