export const match = (pattern: RegExp, string: string) => {
  const match = string.match(pattern)
  return match ? [...match] : []
}
