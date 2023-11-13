import { type FC, type PropsWithChildren } from 'react'
import { cn } from '~/utils/classnames'

export const ErrorText: FC<PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  return <div className={cn('text-sm text-red-300', className)}>{children}</div>
}
