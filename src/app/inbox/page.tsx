import { Inbox } from './inbox'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function Page() {
  await isAuthed()

  return (
    <OuterPageLayout>
      <Inbox />
    </OuterPageLayout>
  )
}
