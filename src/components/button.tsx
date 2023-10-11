import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import type { ComponentProps, ElementType } from 'react'
import { classNameProp } from './helpers'
import { cn } from '@/util/classnames'

const button = cva(
  'rounded-lg border focus:outline-none focus:ring ring-neutral-300',
  {
    variants: {
      intent: {
        primary: 'bg-neutral-50 text-neutral-950 border-blue-500',
        secondary: 'bg-neutral-700 text-neutral-50 border-neutral-800',
        tertiary: 'bg-transparent text-neutral-50 border-neutral-800',
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

export const Button = <T extends ElementType = 'button'>({
  as,
  ...props
}: ButtonProps<T>) => {
  const Component = as || 'button'
  return (
    <Component className={cn(button(props), classNameProp(props))} {...props} />
  )
}
