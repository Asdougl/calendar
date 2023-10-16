import type { ComponentProps, FC } from 'react'
import { cn } from '~/utils/classnames'

export const Label: FC<ComponentProps<'label'>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <label className={cn('text-neutral-300', className)} {...props}>
      {children}
    </label>
  )
}
