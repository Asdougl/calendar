import { redirect } from 'next/navigation'
import { MonthView } from './month-view'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col">
      <MonthView />
      <Navbar />
    </main>
  )
}
