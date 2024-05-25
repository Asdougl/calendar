'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  TicketIcon,
} from '@heroicons/react/24/solid'
import { format, subMonths } from 'date-fns'
import { useSession } from 'next-auth/react'
import { ProfileAvatar } from './ui/avatar'
import { Logo } from './Logo'
import { MiniCalendar } from './MiniCalendar'
import { stdFormat } from './ui/dates/common'
import { cn } from '~/utils/classnames'
import { type PathArgs, createPath } from '~/utils/nav'
import { PathLink } from '~/utils/nav/Link'
import { type Pathname } from '~/utils/nav/path'
import { useQueryParams } from '~/utils/nav/hooks'

const NavCalendar = () => {
  const [searchParams] = useQueryParams()
  const pathname = usePathname()

  const ofParam = searchParams.get('of')

  const activeDate = useMemo(() => {
    return ofParam ? new Date(ofParam) : new Date()
  }, [ofParam])

  const [focusDate, setFocusDate] = useState(activeDate)

  useEffect(() => {
    setFocusDate(ofParam ? new Date(ofParam) : new Date())
  }, [pathname, ofParam])

  return (
    <div className="hidden w-full flex-col gap-1 pb-4 lg:flex">
      <div className="flex justify-between px-2">
        <PathLink
          path="/month"
          query={{ of: stdFormat(focusDate) }}
          className="flex items-center gap-1 rounded px-2 leading-tight lg:hover:bg-neutral-800 xl:gap-2"
        >
          {format(focusDate, 'MMM yyyy')}
        </PathLink>
        <div className="flex gap-1">
          <button
            onClick={() => setFocusDate(subMonths(focusDate, 1))}
            className="rounded bg-neutral-900 p-1 hover:bg-neutral-500"
          >
            <ChevronLeftIcon height={20} />
          </button>
          <button
            onClick={() => setFocusDate(subMonths(focusDate, -1))}
            className="rounded bg-neutral-900 p-1 hover:bg-neutral-500"
          >
            <ChevronLeftIcon height={20} className="rotate-180 transform" />
          </button>
        </div>
      </div>
      <MiniCalendar
        focusDate={focusDate}
        activeDate={activeDate}
        showCurrent={pathname === '/week'}
      />
    </div>
  )
}

const NavBarItem = <Path extends Pathname>(
  props: {
    icon: ReactNode
    label: string
    desktop?: boolean
  } & PathArgs<Path>
) => {
  const pathname = usePathname()

  const navPath = createPath(props)

  const active = pathname === navPath

  return (
    <Link
      href={navPath}
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-lg px-4 py-2 md:hover:bg-neutral-900 md:hover:text-neutral-50 lg:flex-row lg:justify-start lg:px-2',
        active ? 'text-neutral-50 lg:bg-neutral-800' : '',
        {
          'hidden lg:flex': props.desktop,
        }
      )}
    >
      {props.icon}
      <span className="hidden text-sm lg:block">{props.label}</span>
    </Link>
  )
}

const ProfileNavItem = () => {
  const pathname = usePathname()
  const { data } = useSession()

  const active = pathname === '/profile'

  return (
    <PathLink
      path="/profile"
      className={cn(
        'flex w-full flex-col items-center justify-center gap-2 rounded-lg px-4 py-2 md:hover:bg-neutral-900 md:hover:text-neutral-50 lg:flex-row lg:justify-start lg:px-2',
        active ? 'text-neutral-50 lg:bg-neutral-900' : ''
      )}
    >
      <ProfileAvatar
        size="sm"
        className={cn('ring-neutral-300', {
          ring: active,
        })}
      />
      <span className="hidden text-sm lg:block">
        {data?.user?.name || 'profile'}
      </span>
    </PathLink>
  )
}

const CreateEventNavItem = () => {
  const [, updateQueryParams] = useQueryParams()

  return (
    <button
      onClick={() => updateQueryParams({ update: { event: 'new' } })}
      className="hidden items-center gap-2 rounded px-2 py-2 text-neutral-500 hover:bg-neutral-900 hover:text-neutral-50 lg:flex"
    >
      <PlusIcon height={22} /> new event
    </button>
  )
}

export const PowerNavBar = () => {
  return (
    <nav className="mx-auto flex h-24 w-full max-w-4xl shrink-0 items-stretch justify-evenly gap-4 px-4 pb-6 lg:h-full lg:flex-col lg:pt-12">
      <div className="hidden w-full items-center justify-start px-4 lg:flex">
        <Logo size="sm" />
      </div>
      <NavCalendar />
      <NavBarItem
        path="/inbox"
        icon={<InboxIcon height={22} />}
        label="inbox"
      />
      <NavBarItem
        path="/month"
        icon={<CalendarDaysIcon height={22} />}
        label="month"
      />
      <NavBarItem
        path="/search/people"
        icon={<MagnifyingGlassIcon height={22} />}
        label="search"
      />
      <NavBarItem
        path="/events"
        icon={<TicketIcon height={22} />}
        label="events"
        desktop
      />
      <NavBarItem
        path="/categories"
        icon={<TagIcon height={22} />}
        label="categories"
        desktop
      />
      <div className="hidden grow lg:block"></div>
      <CreateEventNavItem />
      <ProfileNavItem />
    </nav>
  )
}
