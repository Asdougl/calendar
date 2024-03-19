import Link from 'next/link'
import { type ComponentProps } from 'react'
import { type Pathname } from './path'
import { type PathArgs, createPath } from '.'

export type PathLinkProps<Path extends Pathname> = PathArgs<Path> &
  Omit<ComponentProps<typeof Link>, 'href' | 'as'>

export const PathLink = <Path extends Pathname>(props: PathLinkProps<Path>) => {
  return <Link href={createPath(props)} {...props} />
}
