import { type FC, type PropsWithChildren } from 'react'
import { type VariantProps, cva } from 'class-variance-authority'
import { Avatar } from './ui/avatar'

const personStyle = cva(
  'flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950',
  {
    variants: {
      size: {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3',
      },
      width: {
        auto: 'w-auto',
        full: 'w-full',
      },
    },
    defaultVariants: {
      size: 'md',
      width: 'full',
    },
  }
)

type PersonProps = {
  id: string
  name?: string | null
  image?: string | null
} & VariantProps<typeof personStyle>

export const Person: FC<PropsWithChildren<PersonProps>> = ({
  id,
  name,
  image,
  children,
  ...props
}) => {
  return (
    <div className={personStyle(props)}>
      <div
        className={`flex items-center ${
          props.size === 'sm' ? 'gap-1' : 'gap-2'
        }`}
      >
        <Avatar
          src={image}
          name={name ?? id}
          size={props.size === 'sm' ? 'xs' : 'sm'}
        />
        {name}
      </div>
      {/* actions */}
      {children}
    </div>
  )
}
