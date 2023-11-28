import { WeekView } from './week-view'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function WeekPage() {
  await isAuthed()

  return (
    <OuterPageLayout fullscreen>
      <WeekView />
    </OuterPageLayout>
  )
}
