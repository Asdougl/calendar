import { type FC, type PropsWithChildren } from 'react'
import { cn } from '~/utils/classnames'

export const Skeleton: FC<
  PropsWithChildren<{ skeletonized: boolean; className?: string }>
> = ({ skeletonized, children, className }) => {
  return (
    <div className={cn('relative', className)}>
      <div className={cn('')}>{children}</div>
      {skeletonized && (
        <div className="absolute left-0 top-0 h-full w-full animate-pulse rounded-full bg-neutral-800"></div>
      )}
    </div>
  )
}
