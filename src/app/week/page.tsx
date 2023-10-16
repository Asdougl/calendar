import { redirect } from 'next/navigation'
import { WeekView } from './week-view'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col">
      <WeekView />
      <Navbar />
    </main>
  )
}
