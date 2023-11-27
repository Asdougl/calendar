import { redirect } from 'next/navigation'
import { Inbox } from './inbox'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { OuterPageLayout } from '~/components/layout/PageLayout'

type InboxParams = {
  searchParams: {
    event?: string
  }
}

export default async function InboxPage({
  searchParams: { event },
}: InboxParams) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const preferences = await api.preferences.getAll.query()

  return (
    <OuterPageLayout fullscreen>
      <Inbox initialPreferences={preferences} eventId={event} />
    </OuterPageLayout>
  )
}
