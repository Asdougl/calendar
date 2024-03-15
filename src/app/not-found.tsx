import { OuterPageLayout } from '~/components/layout/PageLayout'
import { getServerAuthSession } from '~/server/auth'
import { PathLink } from '~/utils/nav/Link'

export default async function Page() {
  const auth = await getServerAuthSession()

  const link = auth ? (
    <PathLink path="/inbox" className="underline">
      inbox
    </PathLink>
  ) : (
    <PathLink path="/login" className="underline">
      login
    </PathLink>
  )

  return (
    <OuterPageLayout hideNav>
      <div className="relative z-0 flex flex-col items-center pt-12">
        <h1 className="text-center text-4xl font-bold">Nope</h1>
        <p className="text-lg">Not sure what you were looking for...</p>
        <p>Try {link}</p>
      </div>
    </OuterPageLayout>
  )
}
