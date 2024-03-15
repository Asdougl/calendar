'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import { cn } from '~/utils/classnames'
import { useLastLocation } from '~/utils/context'
import { type Pathname } from '~/utils/nav/path'

export const BackButton = ({
  whenLastLocation,
  className,
}: {
  whenLastLocation?: Pathname
  className?: string
}) => {
  const router = useRouter()
  const lastLocation = useLastLocation()

  if (whenLastLocation && lastLocation !== whenLastLocation) {
    return null
  }

  return (
    <button
      className={cn(
        'translate-x-1 rounded-full bg-neutral-950 px-2 transition-transform hover:translate-x-0 hover:bg-neutral-900',
        className
      )}
      onClick={() => router.back()}
    >
      <ArrowLeftIcon height={20} />
    </button>
  )
}
