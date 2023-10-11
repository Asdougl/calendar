export const time = {
  seconds: (seconds: number) => seconds * 1000,
  minutes: (minutes: number) => minutes * 60 * 1000,
  hours: (hours: number) => hours * 60 * 60 * 1000,
  days: (days: number) => days * 24 * 60 * 60 * 1000,
} as const
