export const randomFromArray = <T>(array: Readonly<T[]>): T => {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex] ?? randomFromArray(array)
}
