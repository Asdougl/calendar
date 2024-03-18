import { redirect } from 'next/navigation'
import { CreateCategory, EditCategory } from './edit-category'
import { api } from '~/trpc/server'
import { SEARCH_PARAM_NEW } from '~/utils/nav/search'
import { type RouterOutputs } from '~/trpc/shared'

type PageProps = {
  params: {
    categoryId: string
  }
}

export default async function CategoryIdPage({ params }: PageProps) {
  let category: RouterOutputs['category']['one'] | undefined = undefined

  if (params.categoryId !== SEARCH_PARAM_NEW) {
    category = await api.category.one({ id: params.categoryId })

    if (!category) {
      redirect('/categories?error=not-found')
    }
  }

  return category ? (
    <EditCategory initialCategory={category} />
  ) : (
    <CreateCategory />
  )
}
