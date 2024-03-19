import { type RouterOutputs } from '~/trpc/shared'
import { randomFromArray } from '~/utils/array'
import { CategoryColors } from '~/utils/classnames'
import { createTempId } from '~/utils/misc'

type Category = RouterOutputs['category']['all'][number]

export const createMockCategory = (partial?: Partial<Category>): Category => {
  return {
    id: createTempId(),
    name: 'Test Category',
    color: randomFromArray(CategoryColors),
    private: false,
    hidden: false,
    CategoryShare: [],
    ...partial,
  }
}
