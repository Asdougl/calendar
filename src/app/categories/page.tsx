import { CategoriesPage } from './categories'
import { Navbar } from '~/components/Navbar'
import { OuterPageLayout } from '~/components/layout/PageLayout'
import { isAuthed } from '~/utils/auth'

export default async function Home() {
  await isAuthed()

  return (
    <OuterPageLayout>
      <CategoriesPage />
      <Navbar />
    </OuterPageLayout>
  )
}
