import { redirect } from 'next/navigation'
import { TodosView } from './todos-view'
import { Navbar } from '~/components/Navbar'
import { featureEnabled } from '~/utils/flags'
import { isAuthed } from '~/utils/auth'

export default async function Home() {
  await isAuthed()

  if (!featureEnabled('TODOS')) {
    redirect('/inbox')
  }

  return (
    <main className="flex h-screen flex-col">
      <TodosView />
      <Navbar />
    </main>
  )
}
