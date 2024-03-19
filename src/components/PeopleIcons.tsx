import { type ComponentProps } from 'react'
import { Avatar } from './ui/avatar'

type PeopleIconsProps = {
  people: {
    id: string
    name?: string | null
    image?: string | null
  }[]
  size?: ComponentProps<typeof Avatar>['size']
}

export const PeopleIcons = ({ people, size }: PeopleIconsProps) => {
  return (
    <div className="flex flex-row-reverse items-center">
      {people.slice(0, 3).map((person, index) => (
        <div key={person.id} className="-ml-1 flex items-center shadow">
          <Avatar
            name={person.name || index.toString()}
            src={person.image}
            size={size}
          />
        </div>
      ))}
      {people.length > 3 && (
        <div className="-ml-1">
          <Avatar
            name={`+${people.length - 3}`}
            size={size}
            className="bg-neutral-800"
          />
        </div>
      )}
    </div>
  )
}
