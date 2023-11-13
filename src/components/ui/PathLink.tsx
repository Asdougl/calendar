import Link from 'next/link'
import { type FC, type ComponentProps } from 'react'
import { PATHS } from '~/utils/path'

export type PathCreator = (paths: typeof PATHS) => string

export const PathLink: FC<
  Omit<ComponentProps<typeof Link>, 'href'> & {
    path: PathCreator
  }
> = ({ path, children, ...props }) => {
  return (
    <Link href={path(PATHS)} {...props}>
      {children}
    </Link>
  )
}
