import { redirect } from 'next/navigation'
import { DebugSettings, LocalSettings } from './settings'
import { Navbar } from '~/components/Navbar'
import { Header1 } from '~/components/ui/headers'
import { getServerAuthSession } from '~/server/auth'
import { BackButton } from '~/components/BackButton'

export default async function WeekPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col">
      <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden">
        <div className="flex items-center justify-start gap-4 px-4 py-6">
          <BackButton />
          <Header1>Hi {session.user?.name || 'User'}</Header1>
        </div>
        <div className="flex flex-col gap-2">
          <LocalSettings />
          <DebugSettings />
        </div>
      </div>
      <Navbar />
    </main>
  )
}
