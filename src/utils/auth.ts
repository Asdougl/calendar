import 'server-only'
import { redirect } from 'next/navigation'
import { getServerAuthSession } from '~/server/auth'

export const isAuthed = async (redirectTo?: string) => {
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect(redirectTo || '/login')
  }

  return session.user
}
