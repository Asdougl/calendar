import { redirect } from 'next/navigation'
import { Inbox } from './inbox'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <Inbox
        username={session.user.name ?? ''}
        userImage={session.user.image}
        preferences={preferences}
      />
      <Navbar />
    </main>
  )
}
