import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { forwardRef, type ComponentProps, type ElementType } from 'react'
import { classNameProp } from './helpers'
import { cn } from '@/util/classnames'

const button = cva(
  'rounded-lg border focus:outline-none focus:ring ring-neutral-300',
  {
    variants: {
      intent: {
        primary: 'bg-neutral-50 text-neutral-950 border-blue-500',
        secondary: 'bg-neutral-700 text-neutral-50 border-neutral-800',
        tertiary: 'bg-neutral-950 text-neutral-50 border-neutral-800',
        danger: 'bg-red-950 text-neutral-50 border-red-900',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-2 text-lg',
      },
    },
    defaultVariants: {
      intent: 'tertiary',
      size: 'md',
    },
  }
)
type ButtonVariantProps = VariantProps<typeof button>

type ButtonProps<T extends ElementType> = {
  as?: T
} & ButtonVariantProps &
  ComponentProps<T>

/*
export const Button = <T extends ElementType = 'button'>({
  as,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button'

  return (
    <Component {...props} className={cn(button(props), classNameProp(props))} />
  )
}
*/

export const Button = forwardRef(function FwRefButton<
  T extends ElementType = 'button',
>({ as, ...props }: ButtonProps<T>, ref: unknown) {
  const Component = as || 'button'

  return (
    <Component
      {...props}
      ref={ref}
      className={cn(button(props), classNameProp(props))}
    />
  )
}) as <T extends ElementType = 'button'>({
  as,
  ...props
}: ButtonProps<T>) => JSX.Element
