import { useRouter } from 'next/navigation'
import { type Flags, featureEnabled } from './flags'

type PathParamsMap = {
  '/': null
  '/inbox': null
  '/login': null
  '/settings': null
  '/categories': null
  '/week': null
  '/year': null
  '/month': null
  '/periods': null
  '/periods/:id': { id: string }
  '/profile': null
  '/todos': null
}

export type PathName = keyof PathParamsMap

export type PathParams<T extends PathName> = PathParamsMap[T]

export type PathLinkObject<T extends PathName> = PathParams<T> extends null
  ? {
      path: T
      query?: Record<string, string>
    }
  : {
      path: T
      params: PathParams<T>
      query?: Record<string, string>
    }

const PathFlags: Partial<
  Record<PathName, { name: Flags; fallback: PathName }>
> = {
  '/todos': { name: 'TODOS', fallback: '/' },
}

export type PathCreatorParams<Path extends PathName> = {
  path: Path
  params?: PathParams<Path>
  query?: Record<string, string>
}

export const pathReplace = <T extends PathName>({
  path,
  params,
  query,
}: PathCreatorParams<T>) => {
  let newPath: string = path
  const flag = PathFlags[path]
  if (flag && !featureEnabled(flag.name)) {
    newPath = flag.fallback
  }
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      newPath = newPath.replace(`:${key}`, value)
    })
  }
  if (query) {
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    newPath = `${newPath}?${queryString}`
  }
  return newPath
}

export const useNavigate = () => {
  const router = useRouter()

  return <T extends PathName>(params: PathCreatorParams<T>) => {
    router.push(pathReplace(params))
  }
}
