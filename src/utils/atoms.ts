import { atom, useAtom } from 'jotai'

export const originationAtom = atom<string | undefined>('')

export const useOrigination = () => {
  return useAtom(originationAtom)
}
