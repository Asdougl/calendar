import { WeekView } from './week-view'
import { isAuthed } from '~/utils/auth'

export default async function InboxPage() {
  await isAuthed()

  return <WeekView />
}
