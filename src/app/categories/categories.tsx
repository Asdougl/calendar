'use client'

import { PlusIcon } from '@heroicons/react/24/solid'
import { useState, type FC } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '~/components/ui/button'
import { Header1 } from '~/components/ui/headers'
import { Muted } from '~/components/ui/muted'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { cn, getCategoryColor } from '~/utils/classnames'

type CategoriesPageProps = {
  initialCategories: RouterOutputs['category']['all']
}

export const CategoriesPage: FC<CategoriesPageProps> = ({
  initialCategories,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const { data: categories } = api.category.all.useQuery(undefined, {
    initialData: initialCategories,
  })

  const { mutate: mutateCreateCategory } = api.category.create.useMutation()
  const { mutate: mutateDeleteCategory } = api.category.remove.useMutation()
  const { mutate: mutateUpdateCategory } = api.category.update.useMutation()

  return (
    <div className="mx-auto grid h-full w-full max-w-2xl grid-rows-[auto_1fr] overflow-hidden">
      <div className="flex items-center justify-start gap-4 px-4 py-6">
        <Header1>Family</Header1>
      </div>
      <div className="px-4">
        <ul className="flex flex-col rounded-lg border border-neutral-800">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-col border-b border-neutral-800 px-2 py-2 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full',
                      getCategoryColor(category.color, 'bg')
                    )}
                  ></div>
                  <div>{category.name}</div>
                </div>
                <div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveCategory((curr) =>
                        curr === category.id ? null : category.id
                      )
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
              <AnimatePresence initial={false} mode="wait">
                {activeCategory === category.id && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transition: {
                        duration: 0.2,
                      },
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    className="flex items-center overflow-hidden"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <Button size="xs" intent="primary">
                        Save
                      </Button>
                      <Button size="xs" intent="danger">
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          ))}
          <li className="flex h-12 items-center justify-between border-b border-neutral-800 px-2 last:border-b-0">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full',
                  getCategoryColor('', 'bg')
                )}
              >
                <PlusIcon height={12} />
              </div>
              <Muted className="">Create new</Muted>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
