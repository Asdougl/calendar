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
  loading: boolean | undefined
}> = ({ path, icon, label, loading }) => {
  const pathname = usePathname()

  const active = pathname === path

  return (
    <Link
      href={path}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg px-4 py-2 hover:bg-neutral-900 hover:text-neutral-50',
        active ? 'text-neutral-50' : 'text-neutral-500'
      )}
    >
      {!loading ? (
        icon
      ) : (
        <div className="h-5 w-5 animate-pulse rounded-full bg-neutral-800"></div>
      )}
      <div className="px-1">
        <div
          className={cn(
            'relative text-sm leading-none',
            loading && 'text-transparent'
          )}
        >
          {label}
          {loading && (
            <div className="absolute left-0 top-0 h-full w-full py-px">
              <div className="h-full w-full animate-pulse rounded-full bg-neutral-800"></div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export const Navbar: FC<{ loading?: boolean }> = ({ loading }) => {
  return (
    <footer className="pb-6">
      <nav className="left-0 top-0 lg:fixed lg:h-screen">
        <ul className="flex items-center justify-evenly gap-8 px-4 lg:flex-col lg:justify-start lg:py-4">
          <li>
            <NavBarItem
              path="/"
              icon={<InboxIcon height={20} />}
              label="Inbox"
              loading={loading}
            />
          </li>
          <li>
            <NavBarItem
              path="/week"
              icon={<Squares2X2Icon height={20} />}
              label="Week"
              loading={loading}
            />
          </li>
          <li>
            <NavBarItem
              path="/month"
              icon={<CalendarDaysIcon height={20} />}
              label="Month"
              loading={loading}
            />
          </li>
          {featureEnabled('TODOS') && (
            <li>
              <NavBarItem
                path="/todos"
                icon={<CheckCircleIcon height={20} />}
                label="Todos"
                loading={loading}
              />
            </li>
          )}
        </ul>
      </nav>
    </footer>
  )
}
