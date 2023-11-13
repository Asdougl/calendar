const FLAGS = {
  ENABLE_YEAR_VIEW: false,
  TODOS: false,
  CATEGORIES: true,
} as const

export type Flags = keyof typeof FLAGS

export const featureEnabled = (flag: keyof typeof FLAGS) => {
  return FLAGS[flag]
}
