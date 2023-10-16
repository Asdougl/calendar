import type { ComponentProps, FC } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '~/utils/classnames'

const input = cva(
  'border border-neutral-800 bg-neutral-950 text-neutral-50 px-3 py-2 rounded-md focus:outline-none focus:ring ring-neutral-300',
  {
    variants: {
      size: {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
    },
  }
)
type InputVariantProps = VariantProps<typeof input>

export const Input: FC<ComponentProps<'input'> & InputVariantProps> = ({
  className,
  ...props
}) => {
  return <input className={cn(input(props), className)} {...props} />
}
