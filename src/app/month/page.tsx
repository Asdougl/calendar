import { redirect } from 'next/navigation'
import { MonthView } from './month-view'
import { getServerAuthSession } from '~/server/auth'
import { OuterPageLayout } from '~/components/layout/PageLayout'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <OuterPageLayout>
      <MonthView />
    </OuterPageLayout>
  )
}
