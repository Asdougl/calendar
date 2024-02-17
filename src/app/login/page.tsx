import { redirect } from 'next/navigation'
import { Login } from './login'
import { getServerAuthSession } from '~/server/auth'
import { Logo } from '~/components/Logo'

export default async function LoginPage({
  searchParams: { origin },
}: {
  searchParams: { origin?: string }
}) {
  const session = await getServerAuthSession()

  if (session) {
    redirect('/inbox')
  }

  return (
    <main className="flex min-h-screen flex-col px-2 md:px-0">
      <div className="container mx-auto flex flex-grow grid-cols-2 flex-col-reverse justify-end gap-4 divide-neutral-800 lg:grid lg:divide-x lg:py-20">
        <div className="flex flex-col justify-center">
          <Login signup={origin === 'sign-up'} />
        </div>{' '}
        <div className="flex items-center justify-center pt-6">
          <Logo />
        </div>
      </div>
    </main>
  )
}
