import { type Flags, featureEnabled } from './flags'

type PathConfig = {
  flag?: {
    name: Flags
    fallback: string
  }
}

const createPath =
  (path: string, config?: PathConfig) => (query?: Record<string, string>) => {
    if (config?.flag?.name && !featureEnabled(config.flag.name)) {
      return config.flag.fallback
    }
    if (!query) return path
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    return `${path}?${queryString}`
  }

type PathWithQuery = (query?: Record<string, string>) => string

type Path = {
  path: PathWithQuery
  [key: string]:
    | PathWithQuery
    | Path
    | ((...args: string[]) => PathWithQuery | Path)
}

type RootPath = {
  root: PathWithQuery
  [key: string]:
    | PathWithQuery
    | Path
    | ((...args: string[]) => PathWithQuery | Path)
}

export const PATHS = {
  root: createPath('/'),
  login: createPath('/login'),
  settings: {
    path: createPath('/settings'),
    categories: createPath('/settings/categories'),
    debug: createPath('/settings/debug'),
  },
  week: createPath('/week'),
  year: createPath('/year'),
  month: createPath('/month'),
  todos: createPath('/todos', {
    flag: { name: 'TODOS', fallback: '/' },
  }),
} satisfies RootPath
