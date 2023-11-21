import { type FC, type PropsWithChildren } from 'react'
import { cn } from '~/utils/classnames'

export const Skeleton: FC<
  PropsWithChildren<{
    skeletonized?: boolean
    className?: string
    isText?: boolean
  }>
> = ({ skeletonized = true, children, className, isText }) => {
  return (
    <div className={cn('relative !text-transparent', className)}>
      {className ? <div className={className}>{children}</div> : children}
      {skeletonized && (
        <div
          className={cn(
            'absolute left-0 top-0 w-full animate-pulse rounded-full bg-neutral-800',
            isText ? 'my-1 h-[calc(100%-0.5rem)]' : 'h-full'
          )}
        ></div>
      )}
    </div>
  )
}
