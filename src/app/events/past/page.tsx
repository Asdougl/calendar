import { EventsList } from '../events-list'
import { isAuthed } from '~/utils/auth'

export default async function PastEventsPage() {
  await isAuthed()

  return <EventsList direction="before" />
}
