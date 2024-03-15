import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { getWindow } from '../misc'
import { PathMap, type Pathname } from './path'
import { SearchParamKeys, modifySearchParams } from './search'
import { type PathArgs, createPath } from '.'

export const useNavigate = () => {
  const router = useRouter()

  return <T extends Pathname>(params: PathArgs<T>) => {
    router.push(createPath(params))
  }
}

export const useNavPathname = () => {
  const pathname = usePathname()

  const result = PathMap.keyof().safeParse(pathname)

  return result.success ? result.data : null
}

export const useQueryParams = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filteredSearchParams = new Map<SearchParamKeys, string>()
  for (const [key, value] of searchParams) {
    const keyParse = SearchParamKeys.safeParse(key)
    if (keyParse.success) {
      filteredSearchParams.set(keyParse.data, value)
    }
  }

  const updateSearchParams = useCallback(
    (
      modifyConfig: Omit<
        Parameters<typeof modifySearchParams>[0],
        'searchParams'
      >
    ) => {
      const url = new URL(getWindow()?.location.href || '')
      modifySearchParams({
        ...modifyConfig,
        searchParams: url.searchParams,
      })
      router.push(url.toString())
    },
    [router]
  )

  return [filteredSearchParams, updateSearchParams] as const
}
