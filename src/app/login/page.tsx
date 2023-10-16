import { redirect } from 'next/navigation'
import { Login } from './login'
import { getServerAuthSession } from '~/server/auth'

export default async function LoginPage() {
  const session = await getServerAuthSession()

  if (session) {
    redirect('/')
  }

  return <Login />
}
