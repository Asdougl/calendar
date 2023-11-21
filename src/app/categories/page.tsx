import { redirect } from 'next/navigation'
import { CategoriesPage } from './categories'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'
import { featureEnabled } from '~/utils/flags'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  if (!featureEnabled('CATEGORIES')) {
    redirect('/')
  }

  return (
    <main className="flex h-screen flex-col">
      <CategoriesPage />
      <Navbar />
    </main>
  )
}
