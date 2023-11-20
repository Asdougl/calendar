import { redirect } from 'next/navigation'
import { PeriodsView } from './periods-view'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'

export default async function PeriodsPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <PeriodsView />
      <Navbar />
    </main>
  )
}
