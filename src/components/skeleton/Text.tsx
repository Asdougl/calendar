import { type FC, type PropsWithChildren } from 'react'
import { cn } from '~/utils/classnames'

export const SkeletonText: FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => {
  return (
    <div className={cn('relative text-transparent', className)}>
      {children}
      <div className="absolute left-0 top-0 h-full w-full animate-pulse rounded-full bg-neutral-800"></div>
    </div>
  )
}
