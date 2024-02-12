import Link from 'next/link'
import { type ComponentProps } from 'react'
import { pathReplace, type PathName, type PathParams } from '~/utils/path'
import { type SEARCH_PARAMS } from '~/utils/searchParams'

type PathLinkBasicProps<Path extends PathName> = Omit<
  ComponentProps<typeof Link>,
  'href'
> & {
  path: Path
  query?: Partial<Record<SEARCH_PARAMS, string | undefined>>
}

type PathLinkWithParamsProps<Path extends PathName> =
  PathLinkBasicProps<Path> & {
    params: PathParams<Path>
  }

export type PathLinkProps<Path extends PathName> = PathParams<Path> extends null
  ? PathLinkBasicProps<Path>
  : PathLinkWithParamsProps<Path>

export const PathLink = <Path extends PathName>(props: PathLinkProps<Path>) => {
  return <Link href={pathReplace(props)} {...props} />
}
