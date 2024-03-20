import * as Dialog from '@radix-ui/react-dialog'
import { type FC } from 'react'
import { MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Header2 } from '../ui/headers'
import { Person } from '../Person'
import { Button } from '../ui/button'
import { api } from '~/trpc/react'
import { useStateMap } from '~/utils/hooks'
import { useQueryParams } from '~/utils/nav/hooks'
import { SEARCH_PARAM_SEARCH } from '~/utils/nav/search'

type PickablePerson = {
  id: string
  name?: string | null
  image?: string | null
}

type PersonModalSingle = {
  multiple?: false
  initial?: PickablePerson
  onChoose: (person: PickablePerson) => void
}

type PersonModalMultiple = {
  multiple: true
  initial?: PickablePerson[]
  onChoose: (people: PickablePerson[]) => void
}

type PersonModalProps = PersonModalSingle | PersonModalMultiple

const parseInitial = <Props extends PersonModalProps>(
  props: Props
): Record<string, PickablePerson> => {
  if (props.multiple) {
    return (props.initial || []).reduce(
      (acc, person) => {
        acc[person.id] = person
        return acc
      },
      {} as Record<string, PickablePerson>
    )
  }

  return props.initial ? { [props.initial.id]: props.initial } : {}
}

export const PersonModal: FC<PersonModalProps> = ({ ...props }) => {
  const [searchParams, setSearchParams] = useQueryParams()

  const state = useStateMap<string, PickablePerson>(parseInitial(props))

  const { data: following } = api.follow.following.useQuery({
    status: 'ACCEPTED',
  })

  const onOpenChange = (value: boolean) => {
    if (!value) {
      setSearchParams({
        remove: ['person', 'event', 'period'],
      })
    }
  }

  const onChoosePerson = (person: PickablePerson) => {
    if (props.multiple) {
      if (state.has(person.id)) {
        state.delete(person.id)
      } else {
        state.set(person.id, person)
      }
    } else {
      props.onChoose(person)
    }
  }

  return (
    <Dialog.Root
      open={searchParams.get('person') === SEARCH_PARAM_SEARCH}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-0 z-10 flex h-full max-h-screen w-full max-w-xl -translate-x-1/2 flex-col p-6 pt-16 lg:top-24">
          {/* Title */}
          <div className="flex justify-between pb-2">
            <Dialog.Title asChild>
              <Header2>Friends</Header2>
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded px-4 py-2 hover:bg-neutral-800"
                aria-label="close"
              >
                <XMarkIcon height={20} />
              </button>
            </Dialog.Close>
          </div>
          {/* Content */}
          <ul className="flex grow flex-col gap-2 overflow-y-scroll">
            {following?.length ? (
              following.map((f) => (
                <li key={f.following.id}>
                  <Person
                    id={f.following.id}
                    name={f.following.name}
                    image={f.following.image}
                  >
                    <Button
                      size="sm"
                      intent={
                        state.has(f.following.id) ? 'primary' : 'tertiary'
                      }
                      type="button"
                      onClick={() => onChoosePerson(f.following)}
                    >
                      {props.multiple ? (
                        state.has(f.following.id) ? (
                          <MinusIcon height={16} />
                        ) : (
                          <PlusIcon height={16} />
                        )
                      ) : (
                        'Choose'
                      )}
                    </Button>
                  </Person>
                </li>
              ))
            ) : (
              <li className="flex flex-col text-center">
                <p className="text-lg">No friends yet</p>
                <p>You can add friends from your profile</p>
                <p className="text-sm text-neutral-400">
                  People must accept and follow you back to show up here
                </p>
              </li>
            )}
          </ul>
          <div className="flex justify-end py-8">
            {props.multiple && (
              <Button
                intent="primary"
                type="button"
                onClick={() => {
                  props.onChoose(Array.from(state.values()))
                  onOpenChange(false)
                }}
              >
                Done
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
