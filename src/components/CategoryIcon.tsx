import { type Category } from '@prisma/client'
import { type VariantProps, cva } from 'class-variance-authority'
import { type FC } from 'react'
import { cn, getCategoryColor } from '~/utils/classnames'

const categoryIconStyles = cva('text-sm', {
  variants: {
    size: {
      lg: 'h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-full text-white flex',
      sm: 'rounded-sm px-1 leading-3 text-xs flex items-center',
      xs: 'rounded-sm px-1 leading-3 text-xs flex items-center',
    },
  },
})
type StyleProps = VariantProps<typeof categoryIconStyles>

type CategoryIconProps = {
  color?: Category['color']
  icon: string
  className?: string
  hideWithoutCategory?: boolean
} & Required<Pick<StyleProps, 'size'>> &
  Omit<StyleProps, 'size'>

export const CategoryIcon: FC<CategoryIconProps> = ({
  color,
  icon,
  className,
  hideWithoutCategory,
  ...props
}) => {
  if (!color && hideWithoutCategory) return null

  return (
    <div
      className={cn(
        categoryIconStyles(props),
        color
          ? [
              getCategoryColor(color, 'bg'),
              getCategoryColor(color, 'border'),
              getCategoryColor(color, 'alt-text'),
              'border font-bold',
            ]
          : 'bg-neutral-800',
        className
      )}
    >
      {icon}
    </div>
  )
}
