import type { ComponentProps, FC } from 'react'
import { cn } from '~/utils/classnames'

export const Paragraph: FC<ComponentProps<'p'>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn('pb-2 text-neutral-300', className)} {...props}>
      {children}
    </p>
  )
}
