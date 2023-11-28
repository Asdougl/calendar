import {
  ArchiveBoxIcon,
  ClockIcon,
  ListBulletIcon,
  TicketIcon,
} from '@heroicons/react/24/solid'
import { type ReactNode } from 'react'
import {
  DebugSection,
  LogoutSection,
  PreferencesSection,
} from './profile-sections'
import { PageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/components/ui/PathLink'
import { Avatar } from '~/components/ui/avatar'
import { Header2 } from '~/components/ui/headers'
import { type PathLinkObject, type PathName } from '~/utils/path'
import { isAuthed } from '~/utils/auth'

type ProfileLink<T extends PathName> = PathLinkObject<T> & {
  icon: ReactNode
  title: string
}

const LINKS = [
  [
    {
      path: '/events',
      icon: <TicketIcon className="mr-2 h-5 w-5" />,
      title: 'Upcoming Events',
    } as ProfileLink<'/events'>,
    {
      path: '/events/past',
      icon: <ArchiveBoxIcon className="mr-2 h-5 w-5" />,
      title: 'Past Events',
    } as ProfileLink<'/events/past'>,
  ],
  {
    path: '/periods',
    icon: <ClockIcon className="mr-2 h-5 w-5" />,
    title: 'Periods',
  } as ProfileLink<'/periods'>,
  {
    path: '/categories',
    icon: <ListBulletIcon className="mr-2 h-5 w-5" />,
    title: 'Categories',
  } as ProfileLink<'/categories'>,
]

export default async function ProfilePage() {
  const user = await isAuthed()

  return (
    <PageLayout
      title={
        user.name ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Avatar size="xl" src={user.image} name={user.name} />{' '}
            <Header2>{user.name}</Header2>
          </div>
        ) : (
          'Profile'
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 px-4">
          {LINKS.map((link, i) =>
            Array.isArray(link) ? (
              <div key={i} className="flex flex-col gap-2 lg:flex-row">
                {link.map((sublink) => (
                  <PathLink
                    key={sublink.path}
                    path={sublink.path}
                    className="flex flex-1 items-center gap-1 rounded-lg border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
                  >
                    {sublink.icon}
                    {sublink.title}
                  </PathLink>
                ))}
              </div>
            ) : (
              <PathLink
                key={link.path}
                path={link.path}
                className="flex items-center gap-1 rounded-lg border border-neutral-800 px-4 py-2 hover:bg-neutral-900"
              >
                {link.icon}
                {link.title}
              </PathLink>
            )
          )}
        </div>
        <PreferencesSection />
        <DebugSection />
        <LogoutSection />
      </div>
    </PageLayout>
  )
}
