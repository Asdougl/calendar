import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentProps,
  type ElementType,
  type FC,
  type PropsWithChildren,
} from 'react'
import NextLink from 'next/link'
import { Loader } from './Loader'
import { PathLink, type PathLinkProps } from '~/utils/nav/Link'
import { cn } from '~/utils/classnames'
import { type Pathname } from '~/utils/nav/path'

const button = cva(
  'rounded-lg border focus:outline-none focus:ring focus:ring-opacity-50 text-center',
  {
    variants: {
      intent: {
        primary:
          'bg-neutral-50 text-neutral-950 border-blue-500 lg:hover:bg-neutral-200 ring-neutral-100 disabled:text-neutral-400 disabled:bg-neutral-200 disabled:hover:bg-neutral-50 disabled:border-neutral-300 disabled:ring-neutral-100',
        secondary:
          'bg-neutral-700 text-neutral-50 border-neutral-800 hover:bg-neutral-600 ring-neutral-200 disabled:text-neutral-600 disabled:hover:bg-neutral-700 disabled:border-neutral-800 disabled:ring-neutral-200',
        tertiary:
          'bg-neutral-950 text-neutral-50 border-neutral-800 hover:bg-neutral-900 ring-neutral-400 disabled:text-neutral-600 disabled:hover:bg-neutral-950 disabled:border-neutral-800 disabled:ring-neutral-400',
        danger:
          'bg-red-950 text-neutral-50 border-red-900 hover:bg-red-900 ring-red-300 disabled:text-neutral-600 disabled:hover:bg-red-950 disabled:border-red-900 disabled:ring-red-300',
        success:
          'bg-green-950 text-neutral-50 border-green-900 hover:bg-green-900 ring-green-300 disabled:text-neutral-600 disabled:hover:bg-green-950 disabled:border-green-900 disabled:ring-green-300',
      },
      size: {
        xs: 'px-2 py-1 text-xs',
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-2 text-lg',
        xl: 'px-8 py-3 text-2xl font-bold',
      },
    },
    defaultVariants: {
      intent: 'tertiary',
      size: 'md',
    },
  }
)
type ButtonVariantProps = VariantProps<typeof button>

export type ButtonProps<T extends ElementType> = ButtonVariantProps &
  ComponentProps<T>

export const Button = forwardRef<HTMLButtonElement, ButtonProps<'button'>>(
  function FwdButton({ className, type = 'submit', ...props }, ref) {
    return (
      <button
        {...props}
        type={type}
        ref={ref}
        className={cn(button(props), className)}
      />
    )
  }
)

export const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonProps<'a'>>(
  function FwdButtonLink({ className, ...props }, ref) {
    return <a {...props} ref={ref} className={cn(button(props), className)} />
  }
)

type ButtonLinkProps<Path extends Pathname> = PathLinkProps<Path> &
  ButtonVariantProps

export const ButtonLink = <Path extends Pathname>(
  props: ButtonLinkProps<Path>
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className, ...rest } = props
  return (
    <PathLink<Path> {...props} className={cn(button(rest), props.className)} />
  )
}

export const ButtonRawLink = forwardRef<
  HTMLAnchorElement,
  ButtonProps<typeof NextLink>
>(function FwdButtonRawLink({ className, ...props }, ref) {
  return (
    <NextLink {...props} ref={ref} className={cn(button(props), className)} />
  )
})

export const SkeletonButton: FC<
  PropsWithChildren<ButtonVariantProps & { className?: string }>
> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        button(props),
        'animate-pulse bg-neutral-800 text-transparent',
        className
      )}
    >
      {children}
    </div>
  )
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
