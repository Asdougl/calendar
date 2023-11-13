import { type VariantProps, cva } from 'class-variance-authority'
import { type FC } from 'react'
import { cn } from '~/utils/classnames'

const loaderStyle = cva('animate-spin rounded-full border-2', {
  variants: {
    intent: {
      primary: 'border-neutral-200 border-t-neutral-800',
      secondary: 'border-neutral-600 border-t-neutral-200',
      tertiary: 'border-neutral-800 border-t-neutral-200',
      danger: 'border-red-900 border-t-red-600',
      success: 'border-green-900 border-t-green-600',
    },
  },
  defaultVariants: {
    intent: 'tertiary',
  },
})

type LoaderProps = {
  className?: string
} & VariantProps<typeof loaderStyle>

export const Loader: FC<LoaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-testid="loader"
      className={cn('h-6 w-6', loaderStyle(props), className)}
    ></div>
  )
}

export const InlineLoader: FC<LoaderProps> = ({ className, ...props }) => {
  return (
    <div
      data-testid="loader"
      className={cn('h-[1em] w-[1em]', loaderStyle(props), className)}
    ></div>
  )
}
