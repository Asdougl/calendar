import { type Pathname, type PathMap } from './path'
import { type SearchParamKeys } from './search'

export type PathArgs<T extends Pathname> = PathMap[T] extends null
  ? {
      path: T
      query?: Partial<Record<SearchParamKeys, string>>
    }
  : {
      path: T
      params: PathMap[T]
      query?: Partial<Record<SearchParamKeys, string>>
    }

export const createPath = <T extends Pathname>(args: PathArgs<T>) => {
  let newPath: string = args.path
  if ('params' in args && args.params) {
    Object.entries(args.params).forEach(([key, value]) => {
      newPath = newPath.replace(`:${key}`, value)
    })
  }
  if (args.query) {
    const searchParams = new URLSearchParams()
    Object.entries(args.query).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      }
    })
    newPath += `?${searchParams.toString()}`
  }
  return newPath
}
