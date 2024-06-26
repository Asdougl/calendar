import {
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  TagIcon,
  TicketIcon,
  UsersIcon,
} from '@heroicons/react/24/solid'
import { type ReactNode } from 'react'
import { FollowStats } from './follow-stats'
import { LogoutButton } from './logout'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/utils/nav/Link'
import { Avatar } from '~/components/ui/avatar'
import { Header2 } from '~/components/ui/headers'
import { isAuthed } from '~/utils/auth'
import { type PathArgs } from '~/utils/nav'
import { type Pathname } from '~/utils/nav/path'

type ProfileLink<T extends Pathname> = PathArgs<T> & {
  icon: ReactNode
  title: string
}

const LINKS = [
  {
    path: '/people',
    icon: <UsersIcon className="mr-2 h-5 w-5" />,
    title: 'People',
  } as ProfileLink<'/people'>,
  {
    path: '/categories',
    icon: <TagIcon className="mr-2 h-5 w-5" />,
    title: 'Categories',
  } as ProfileLink<'/categories'>,
  {
    path: '/periods',
    icon: <ClockIcon className="mr-2 h-5 w-5" />,
    title: 'Periods',
  } as ProfileLink<'/periods'>,
  {
    path: '/events',
    icon: <TicketIcon className="mr-2 h-5 w-5" />,
    title: 'Events',
  } as ProfileLink<'/events'>,
  {
    path: '/events/past',
    icon: <ClockIcon className="mr-2 h-5 w-5" />,
    title: 'Past Events',
  } as ProfileLink<'/events/past'>,
  {
    path: '/settings',
    icon: <Cog6ToothIcon className="mr-2 h-5 w-5" />,
    title: 'Settings',
  } as ProfileLink<'/settings'>,
]

export default async function ProfilePage() {
  const user = await isAuthed()

  return (
    <InnerPageLayout
      title={
        user.name ? (
          <div className="col-span-3 flex flex-col items-center justify-center gap-2">
            <Avatar size="xl" src={user.image} name={user.name} />{' '}
            <Header2>{user.name}</Header2>
          </div>
        ) : (
          'Profile'
        )
      }
    >
      <div className="flex flex-col gap-4 overflow-y-auto">
        <div className="flex justify-center">
          <FollowStats />
        </div>
        <div className="flex flex-col gap-2 px-4">
          {LINKS.map((link) => (
            <PathLink
              key={link.path}
              path={link.path}
              className="flex items-center justify-between rounded-lg border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
            >
              <div className="flex items-center gap-1">
                {link.icon}
                {link.title}
              </div>
              <ChevronRightIcon className="h-5 w-5" />
            </PathLink>
          ))}
        </div>
        <LogoutButton />
      </div>
    </InnerPageLayout>
  )
}
