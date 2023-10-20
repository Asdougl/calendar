import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentProps,
  type ElementType,
  type FC,
} from 'react'
import Link from 'next/link'
import { Loader } from './Loader'
import { cn } from '~/utils/classnames'

const button = cva(
  'rounded-lg border focus:outline-none focus:ring focus:ring-opacity-50',
  {
    variants: {
      intent: {
        primary:
          'bg-neutral-50 text-neutral-950 border-blue-500 hover:bg-neutral-200 ring-neutral-100',
        secondary:
          'bg-neutral-700 text-neutral-50 border-neutral-800 hover:bg-neutral-600 ring-neutral-200',
        tertiary:
          'bg-neutral-950 text-neutral-50 border-neutral-800 hover:bg-neutral-900 ring-neutral-400',
        danger:
          'bg-red-950 text-neutral-50 border-red-900 hover:bg-red-900 ring-red-300',
        success:
          'bg-green-950 text-neutral-50 border-green-900 hover:bg-green-900 ring-green-300',
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

type SubmitButtonProps = ButtonProps<'button'> & {
  loading?: boolean
}

export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  function FwdSubmitButton(
    { loading, className, children, type = 'submit', ...props },
    ref
  ) {
    return (
      <button
        {...props}
        type={type}
        ref={ref}
        className={cn(button(props), 'relative', className)}
      >
        <span className={loading ? 'opacity-0' : 'opacity-100'}>
          {children}
        </span>
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
          <Loader
            intent={props.intent}
            className={loading ? 'opacity-100' : 'opacity-0'}
          />
        </div>
      </button>
    )
  }
)
