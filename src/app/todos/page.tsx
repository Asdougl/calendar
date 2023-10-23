import { redirect } from 'next/navigation'
import { TodosView } from './todos-view'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'
import { featureEnabled } from '~/utils/flags'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  if (!featureEnabled('TODOS')) {
    redirect('/')
  }

  return (
    <main className="flex h-screen flex-col">
      <TodosView />
      <Navbar />
    </main>
  )
}
