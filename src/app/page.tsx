import { redirect } from 'next/navigation'
import { ButtonLink } from '~/components/ui/button'
import { getServerAuthSession } from '~/server/auth'

export default async function IndexPage() {
  const session = await getServerAuthSession()

  if (session) {
    redirect('/inbox')
  }

  return (
    <main>
      <div className="py-16">
        <div className="flex flex-col items-center gap-2">
          <div className="text-8xl">👋</div>
          <div className="text-8xl">Welcome to</div>
          <div className="font-mono text-6xl">asdougl/calendar</div>
          <div className="py-8">
            <ButtonLink size="xl" intent="primary" path="/login">
              Login
            </ButtonLink>
          </div>
        </div>
      </div>
    </main>
  )
}
