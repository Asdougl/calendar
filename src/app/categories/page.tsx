import { redirect } from 'next/navigation'
import { CategoriesPage } from './categories'
import { Navbar } from '~/components/Navbar'
import { getServerAuthSession } from '~/server/auth'
import { featureEnabled } from '~/utils/flags'
import { api } from '~/trpc/server'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  if (!featureEnabled('CATEGORIES')) {
    redirect('/')
  }

  const categories = await api.category.all.query()

  return (
    <main className="flex h-screen flex-col">
      <CategoriesPage initialCategories={categories} />
      <Navbar />
    </main>
  )
}
