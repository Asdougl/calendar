import { type FC, type PropsWithChildren } from 'react'
import { cn } from '~/utils/classnames'

export const SkeletonText: FC<
  PropsWithChildren<{ className?: string; skeletonized: boolean }>
> = ({ className, skeletonized = true, children }) => {
  return (
    <div
      className={cn('relative', skeletonized && 'text-transparent', className)}
    >
      {children}
      {skeletonized && (
        <div className="absolute left-0 top-0 h-full w-full animate-pulse rounded-full bg-neutral-800"></div>
      )}
    </div>
  )
}
