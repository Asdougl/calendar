import { redirect } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { PeriodEditForm } from './period-edit-form'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import { PageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/components/ui/PathLink'

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
    <PageLayout
      title={period ? 'Edit Period' : 'Create Period'}
      headerLeft={
        <PathLink path="/periods">
          <ArrowLeftIcon height={24} />
        </PathLink>
      }
    >
      <PeriodEditForm period={period} />
    </PageLayout>
  )
}
