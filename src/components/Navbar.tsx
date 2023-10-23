'use client'

import {
  CalendarDaysIcon,
  CheckCircleIcon,
  InboxIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid'
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

  return (
    <a
      href={path}
      className={cn(
        'flex flex-col items-center gap-1 px-4 py-2 hover:text-neutral-50',
        {
          'text-neutral-50': pathname === path,
          'text-neutral-500': pathname !== path,
        }
      )}
    >
      {icon}
      <div className="text-sm">{label}</div>
    </a>
  )
}

export const Navbar = () => {
  return (
    <footer className="pb-6">
      <nav className="left-0 top-0 md:fixed md:h-screen">
        <ul className="flex items-center justify-between gap-8 px-4 md:flex-col md:justify-start md:py-4">
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
