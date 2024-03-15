import { redirect } from 'next/navigation'
import EditCategory from './edit-category'
import { api } from '~/trpc/server'

type PageProps = {
  params: {
    categoryId: string
  }
}

export default async function CategoryIdPage({ params }: PageProps) {
  const category = await api.category.one.query({ id: params.categoryId })

  if (!category) {
    redirect('/categories?error=not-found')
  }

  return <EditCategory initialCategory={category} />
}
