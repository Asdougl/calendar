import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'

type RefreshIconProps = {
  loading: boolean
  onClick: () => void
  className?: string
}

export const RefreshIcon = ({
  loading,
  className,
  onClick,
}: RefreshIconProps) => {
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    if (!loading) {
      setShowCheck(true)

      timeout = setTimeout(() => {
        setShowCheck(false)
      }, 500)
    }

    return () => clearTimeout(timeout)
  }, [loading])

  return (
    <button onClick={onClick} className={className}>
      {loading ? (
        <ArrowPathIcon height={20} className="animate-spin" />
      ) : showCheck ? (
        <CheckIcon height={20} />
      ) : (
        <ArrowPathIcon height={20} />
      )}
    </button>
  )
}

// starts loading -> show spinner
// stops loading -> show checkmark
// stops loading after 500ms -> hide checkmark
