'use client'

import {
  CalendarDaysIcon,
  InboxIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid'
import { usePathname } from 'next/navigation'
import type { FC, ReactNode } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ProfileLink } from './ui/avatar'
import { cn } from '~/utils/classnames'
import {
  type PathCreatorParams,
  type PathName,
  pathReplace,
} from '~/utils/path'

const NavBarItem = <Path extends PathName>({
  icon,
  label,
  ...pathParams
}: {
  icon: ReactNode
  label: string
} & PathCreatorParams<Path>) => {
  const pathname = usePathname()

  const navPath = pathReplace(pathParams)

  const active = pathname === navPath

  return (
    <Link
      href={navPath}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg px-4 py-2 md:hover:bg-neutral-900 md:hover:text-neutral-50',
        active ? 'text-neutral-50' : 'text-neutral-500'
      )}
    >
      {icon}
      <span className="hidden lg:block">{label}</span>
    </Link>
  )
}

export const Navbar: FC<{ loading?: boolean }> = () => {
  const { data } = useSession()

  if (!data) return null

  return (
    <footer className="pb-6">
      <nav className="left-0 top-0 lg:fixed lg:h-screen">
        <ul className="flex items-center justify-evenly gap-8 px-4 lg:flex-col lg:justify-start lg:py-4">
          <li className="flex h-16 items-center justify-center">
            <NavBarItem
              path="/inbox"
              icon={<InboxIcon height={22} />}
              label="inbox"
            />
          </li>
          <li className="flex h-16 items-center justify-center">
            <NavBarItem
              path="/week"
              icon={<Squares2X2Icon height={22} />}
              label="week"
            />
          </li>
          <li className="flex h-16 items-center justify-center">
            <NavBarItem
              path="/month"
              icon={<CalendarDaysIcon height={22} />}
              label="month"
            />
          </li>
          <li className="flex h-16 items-center justify-center">
            <NavBarItem
              path="/profile"
              icon={<ProfileLink size="sm" />}
              label="Profile"
            />
          </li>
        </ul>
      </nav>
    </footer>
  )
}
