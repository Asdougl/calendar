import { redirect } from 'next/navigation'
import { Inbox } from './inbox'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { OuterPageLayout } from '~/components/layout/PageLayout'

export default async function Home() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <OuterPageLayout>
      <Inbox preferences={preferences} />
    </OuterPageLayout>
  )
}
