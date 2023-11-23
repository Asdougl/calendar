import { redirect } from 'next/navigation'
import { Login } from './login'
import { getServerAuthSession } from '~/server/auth'
import { PageLayout } from '~/components/layout/PageLayout'

export default async function LoginPage({
  searchParams: { origin },
}: {
  searchParams: { origin?: string }
}) {
  const session = await getServerAuthSession()

  if (session) {
    redirect('/')
  }

  return (
    <PageLayout title={<h1 className="font-mono text-lg">asdougl/calendar</h1>}>
      <Login signup={origin === 'sign-up'} />
    </PageLayout>
  )
}
