import { redirect } from 'next/navigation'
import { WeekView } from './week-view'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { OuterPageLayout } from '~/components/layout/PageLayout'

export default async function WeekPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <OuterPageLayout>
      <WeekView preferences={preferences} />
    </OuterPageLayout>
  )
}
