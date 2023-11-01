'use client'

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  InboxIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { FC, ReactNode } from 'react'
import { cn } from '~/utils/classnames'
import { featureEnabled } from '~/utils/flags'

const NavBarItem: FC<{
  path: string
  icon: ReactNode
  label: string
}> = ({ path, icon, label }) => {
  const pathname = usePathname()

  const active = pathname === path

  return (
    <Link
      href={path}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg px-4 py-2 md:hover:bg-neutral-900 md:hover:text-neutral-50',
        active ? 'text-neutral-50' : 'text-neutral-500'
      )}
    >
      {icon}
      <div className="px-1">
        <div className="text-sm leading-none">{label}</div>
      </div>
    </Link>
  )
}

export const Navbar: FC<{ loading?: boolean }> = () => {
  return (
    <footer className="pb-6">
      <nav className="left-0 top-0 lg:fixed lg:h-screen">
        <ul className="flex items-center justify-evenly gap-8 px-4 lg:flex-col lg:justify-start lg:py-4">
          <li>
            <NavBarItem
              path="/"
              icon={<InboxIcon height={20} />}
              label="Inbox"
            />
          </li>
          <li>
            <NavBarItem
              path="/week"
              icon={<Squares2X2Icon height={20} />}
              label="Week"
            />
          </li>
          <li>
            <NavBarItem
              path="/month"
              icon={<CalendarDaysIcon height={20} />}
              label="Month"
            />
          </li>
          {featureEnabled('TODOS') && (
            <li>
              <NavBarItem
                path="/todos"
                icon={<CheckCircleIcon height={20} />}
                label="Todos"
              />
            </li>
          )}
        </ul>
      </nav>
    </footer>
  )
}
