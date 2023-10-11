'use client'

import {
  CalendarDaysIcon,
  GlobeAltIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/solid'
import { usePathname } from 'next/navigation'
import type { FC, ReactNode } from 'react'
import { cn } from '@/util/classnames'

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
        'flex flex-col items-center py-2 px-4 gap-1 hover:text-neutral-50',
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
      <nav className="md:fixed left-0 top-0 md:h-screen">
        <ul className="grid grid-cols-3 md:flex flex-col gap-8 md:py-4">
          <li>
            <NavBarItem
              path="/"
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
          <li>
            <NavBarItem
              path="/year"
              icon={<GlobeAltIcon height={20} />}
              label="Year"
            />
          </li>
        </ul>
      </nav>
    </footer>
  )
}
