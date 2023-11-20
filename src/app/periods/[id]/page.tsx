import { redirect } from 'next/navigation'
import { PeriodEditForm } from './period-edit-form'
import { Header1 } from '~/components/ui/headers'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'

export default async function PeriodEdit({
  params: { id },
}: {
  params: { id: string }
}) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login')
  }

  const period = id !== 'new' ? await api.periods.one.query({ id }) : null

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-6">
          <Header1>{period ? period.name : 'New Period'}</Header1>
        </header>
        <PeriodEditForm period={period} />
      </div>
    </main>
  )
}
