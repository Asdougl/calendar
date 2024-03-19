'use client'

import {
  CalendarDaysIcon,
  InboxIcon,
  QueueListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { usePathname } from 'next/navigation'
import type { FC, ReactNode } from 'react'
import Link from 'next/link'
import { ProfileAvatar } from './ui/avatar'
import { cn } from '~/utils/classnames'
import { type PathArgs, createPath } from '~/utils/nav'
import { type Pathname } from '~/utils/nav/path'
import { PathLink } from '~/utils/nav/Link'

const NavBarItem = <Path extends Pathname>(
  props: {
    icon: ReactNode
    label: string
  } & PathArgs<Path>
) => {
  const pathname = usePathname()

  const navPath = createPath(props)

  const active = pathname === navPath

  return (
    <Link
      href={navPath}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg px-4 py-2 md:hover:bg-neutral-900 md:hover:text-neutral-50',
        active ? 'text-neutral-50' : 'text-neutral-500'
      )}
    >
      {props.icon}
      <span className="hidden lg:block">{props.label}</span>
    </Link>
  )
}

const ProfileNavItem = () => {
  const pathname = usePathname()

  const active = pathname === '/profile'

  return (
    <PathLink
      path="/profile"
      className="flex flex-col items-center gap-2 rounded-lg px-4 py-2 md:hover:bg-neutral-900 md:hover:text-neutral-50"
    >
      <ProfileAvatar
        size="sm"
        className={cn('ring-neutral-300', { ring: active })}
      />
      <span className="hidden lg:block">profile</span>
    </PathLink>
  )
}

export const Navbar: FC<{ loading?: boolean }> = () => {
  return (
    <footer className="sticky bottom-0 bg-neutral-950 pb-6 lg:static">
      <nav className="left-0 top-0 lg:fixed lg:h-screen">
        <ul className="flex items-center justify-evenly lg:flex-col lg:justify-start lg:gap-6 lg:px-2 lg:py-4">
          <li className="flex h-16 flex-1 items-center justify-center">
            <NavBarItem
              path="/inbox"
              icon={<InboxIcon height={22} />}
              label="inbox"
            />
          </li>
          <li className="flex h-16 flex-1 items-center justify-center">
            <NavBarItem
              path="/shared"
              icon={<UserGroupIcon height={22} />}
              label="shared"
            />
          </li>
          <li className="flex h-16 flex-1 items-center justify-center">
            <NavBarItem
              path="/month"
              icon={<CalendarDaysIcon height={22} />}
              label="month"
            />
          </li>
          <li className="flex h-16 flex-1 items-center justify-center">
            <NavBarItem
              path="/events"
              icon={<QueueListIcon height={22} />}
              label="events"
            />
          </li>
          <li className="flex h-16 flex-1 items-center justify-center">
            <ProfileNavItem />
          </li>
        </ul>
      </nav>
    </footer>
  )
}
