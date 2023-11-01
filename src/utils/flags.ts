const FLAGS = {
  ENABLE_YEAR_VIEW: false,
  TODOS: false,
  CATEGORIES: true,
} as const

export const featureEnabled = (flag: keyof typeof FLAGS) => {
  return FLAGS[flag]
}
