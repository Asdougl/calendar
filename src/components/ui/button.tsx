import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentProps,
  type ElementType,
  type FC,
} from 'react'
import Link from 'next/link'
import { cn } from '~/utils/classnames'

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

type ButtonProps<T extends ElementType> = ButtonVariantProps & ComponentProps<T>

export const Button = forwardRef<HTMLButtonElement, ButtonProps<'button'>>(
  function FwdButton({ className, ...props }, ref) {
    return (
      <button {...props} ref={ref} className={cn(button(props), className)} />
    )
  }
)

export const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonProps<'a'>>(
  function FwdButtonLink({ className, ...props }, ref) {
    return <a {...props} ref={ref} className={cn(button(props), className)} />
  }
)

export const ButtonLink: FC<ButtonProps<typeof Link>> = ({
  className,
  ...props
}) => {
  return <Link {...props} className={cn(button(props), className)} />
}
