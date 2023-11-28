import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { PeriodEditForm } from './period-edit-form'
import { api } from '~/trpc/server'
import { PageLayout } from '~/components/layout/PageLayout'
import { PathLink } from '~/components/ui/PathLink'
import { pathReplace } from '~/utils/path'
import { isAuthed } from '~/utils/auth'

type PathParams = {
  path: '/periods' | '/week' | '/inbox'
  query: Record<string, string | undefined> | undefined
}

const decodeOrigin = (origin?: string): PathParams => {
  if (origin) {
    if (origin.includes('week')) {
      return {
        path: '/week',
        query: {
          start: origin.split('week-')[1],
        },
      }
    } else if (origin === 'inbox') {
      return {
        path: '/inbox',
        query: undefined,
      }
    }
  }

  return {
    path: '/periods',
    query: undefined,
  }
}

export default async function PeriodEdit({
  params: { id },
  searchParams: { origin },
}: {
  params: { id: string }
  searchParams: { origin?: string }
}) {
  await isAuthed()

  const period = id !== 'new' ? await api.periods.one.query({ id }) : null

  const { path, query } = decodeOrigin(origin)

  return (
    <PageLayout
      title={period ? 'Edit Period' : 'Create Period'}
      headerLeft={
        <PathLink path={path} query={query}>
          <ArrowLeftIcon height={24} />
        </PathLink>
      }
    >
      <PeriodEditForm period={period} origin={pathReplace({ path, query })} />
    </PageLayout>
  )
}
