'use client'

import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'

export const BackButton = () => {
  const router = useRouter()

  return (
    <button className="" onClick={() => router.back()}>
      <ArrowLeftIcon height={20} />
    </button>
  )
}
