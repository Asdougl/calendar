import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { searchParams } = new URL(req.url)
  const error = searchParams.get('error')

  if (error) {
    const errorUrl = new URL('/login', req.url)
    errorUrl.searchParams.set('error', error)

    const description = searchParams.get('error_description')
    if (description) errorUrl.searchParams.set('error_description', description)

    const erroruri = searchParams.get('error_uri')
    if (erroruri) errorUrl.searchParams.set('error_uri', erroruri)

    return NextResponse.redirect(errorUrl)
  }

  const code = searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/', req.url))
}
