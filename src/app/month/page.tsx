import { redirect } from 'next/navigation'
import { MonthView } from './month-view'
import { getServerAuthSession } from '~/server/auth'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { api } from '~/trpc/server'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <OuterPageLayout fullscreen>
      <MonthView initialPreferences={preferences} />
    </OuterPageLayout>
  )
}
