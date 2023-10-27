import { type FC } from 'react'
import { cn } from '~/utils/classnames'

type DisplayPictureProps = {
  src?: string | null
  username: string
  className?: string
}

export const DisplayPicture: FC<DisplayPictureProps> = ({
  src,
  username,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-neutral-800">
        {src ? (
          /* eslint-disable-next-line */
          <img src={src} alt={username} className="h-full w-full" />
        ) : (
          <div className="text-neutral-400">{username[0]?.toUpperCase()}</div>
        )}
      </div>
    </div>
  )
}
