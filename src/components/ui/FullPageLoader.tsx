import { type FC } from 'react'
import { Loader } from './Loader'

export const FullPageLoader: FC = () => {
  return (
    <div className="fixed left-0 top-0 flex h-screen w-screen items-center justify-center">
      <Loader />
    </div>
  )
}
