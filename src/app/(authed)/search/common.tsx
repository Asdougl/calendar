'use client'

import { usePathname } from 'next/navigation'
import { cn } from '~/utils/classnames'
import { PathLink } from '~/utils/nav/Link'

export const SearchTabs = () => {
  const pathname = usePathname()

  return (
    <div className="flex gap-2 pb-4">
      <PathLink
        path="/search/people"
        className={cn(
          'rounded-full border border-neutral-800 px-4 py-0.5 text-sm',
          pathname === '/search/people' && 'bg-neutral-800'
        )}
      >
        People
      </PathLink>
      <PathLink
        path="/search/events"
        className={cn(
          'rounded-full border border-neutral-800 px-4 py-0.5 text-sm',
          pathname === '/search/events' && 'bg-neutral-800'
        )}
      >
        Events
      </PathLink>
    </div>
  )
}
