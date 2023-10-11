import type { ComponentProps, FC } from 'react'
import { cn } from '@/util/classnames'

export const Paragraph: FC<ComponentProps<'p'>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('text-neutral-300 pb-2', className)} {...props}>
      {children}
    </p>
  )
}
