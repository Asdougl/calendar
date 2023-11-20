import { redirect } from 'next/navigation'
import { PeriodApiWrapper } from './period-edit-form'
import { getServerAuthSession } from '~/server/auth'

export default async function PeriodEdit({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <PeriodApiWrapper id={id} />
    </main>
  )
}
