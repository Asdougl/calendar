import { redirect } from 'next/navigation'
import { TodosView } from './todos-view'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col">
      <TodosView />
      <Navbar />
    </main>
  )
}
