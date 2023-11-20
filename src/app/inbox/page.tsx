import { redirect } from 'next/navigation'
import { InboxPreferencesWrapper } from './inbox'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <InboxPreferencesWrapper
        username={session.user.name ?? ''}
        userImage={session.user.image}
      />
      <Navbar />
    </main>
  )
}
