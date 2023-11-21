import { redirect } from 'next/navigation'
import { WeekView } from './week-view'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'

export default async function WeekPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <main className="flex h-screen flex-col">
      <WeekView preferences={preferences} />
      <Navbar />
    </main>
  )
}
