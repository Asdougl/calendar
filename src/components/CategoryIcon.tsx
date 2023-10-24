import { type Category } from '@prisma/client'
import { type VariantProps, cva } from 'class-variance-authority'
import { type FC } from 'react'
import { cn, getCategoryColor } from '~/utils/classnames'

const lgClassName =
  'h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-full text-white flex'
const smClassName = 'h-full rounded-sm px-[6px] leading-snug'

const categoryIconStyles = cva('text-sm', {
  variants: {
    size: {
      lg: lgClassName,
      sm: smClassName,
      dynamic: `${smClassName} ${lgClassName
        .split(' ')
        .map((c) => `md:${c}`)
        .join(' ')}`,
    },
  },
})
type StyleProps = VariantProps<typeof categoryIconStyles>

type CategoryIconProps = {
  category?: Pick<Category, 'icon' | 'color'> | null
  title: string
  className?: string
  hideWithoutCategory?: boolean
} & Required<Pick<StyleProps, 'size'>> &
  Omit<StyleProps, 'size'>

export const CategoryIcon: FC<CategoryIconProps> = ({
  category,
  title,
  className,
  hideWithoutCategory,
  ...props
}) => {
  if (!category && hideWithoutCategory) return null

  return (
    <div
      className={cn(
        categoryIconStyles(props),
        category
          ? [
              getCategoryColor(category.color, 'bg'),
              getCategoryColor(category.color, 'border'),
              'border',
            ]
          : 'bg-neutral-800',
        className
      )}
    >
      {category ? category.icon : title[0]}
    </div>
  )
}
