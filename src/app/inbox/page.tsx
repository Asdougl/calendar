import { Inbox } from './inbox'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

type InboxParams = {
  searchParams: {
    event?: string
  }
}

export default async function InboxPage({
  searchParams: { event },
}: InboxParams) {
  await isAuthed()

  return (
    <OuterPageLayout fullscreen>
      <Inbox eventId={event} />
    </OuterPageLayout>
  )
}
