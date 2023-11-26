'use client'

import { useEffect, useState } from 'react'
import { Switch } from '~/components/ui/switch'
import { CategoryIcon } from '~/components/CategoryIcon'
import { Field, InputField } from '~/components/ui/Field'
import { Button, SubmitButton } from '~/components/ui/button'
import { Header1 } from '~/components/ui/headers'
import { Input } from '~/components/ui/input'
import { Select } from '~/components/ui/select'
import { randomFromArray } from '~/utils/array'
import { CategoryColors } from '~/utils/classnames'
import { UncontrolledDatePicker } from '~/components/ui/dates/DatePicker'
import { Label } from '~/components/ui/label'
import { SkeletonText } from '~/components/skeleton/Text'
import { UncontrolledDateRangePicker } from '~/components/ui/dates/DateRangePicker'
import { TimeInput } from '~/components/ui/input/time'

const randomEmojis = [
  '🤣',
  '😂',
  '😎',
  '🤩',
  '😍',
  '😘',
  '😗',
  '😙',
  '😚',
  '🙂',
  '🤗',
  '🤔',
  '🤨',
  '😐',
  '😑',
  '😶',
  '🙄',
  '😏',
  '😣',
  '😥',
  '😮',
  '🤐',
  '😯',
  '😪',
  '😫',
  '😴',
  '😌',
  '😛',
  '😜',
  '😝',
  '🤤',
  '😒',
  '😓',
  '😔',
  '😕',
  '🙃',
  '🤑',
  '😲',
  '🙁',
  '😖',
  '😞',
  '😟',
  '😤',
  '😢',
  '😭',
  '😦',
  '😧',
  '😨',
  '😩',
  '🤯',
  '😬',
  '😰',
  '😱',
  '🥵',
  '🥶',
  '😳',
  '🤪',
  '😵',
  '😡',
  '😠',
  '🤬',
  '😷',
  '🤒',
  '🤕',
  '🤢',
  '🤮',
  '🤧',
  '😇',
  '🤠',
  '🤡',
  '🥳',
  '🥴',
  '🥺',
  '🤥',
  '🤫',
  '🤭',
  '🧐',
  '🤓',
  '😈',
  '👿',
  '👹',
  '👺',
  '💀',
  '👻',
  '👽',
  '🤖',
  '💩',
  '😺',
  '😸',
  '😹',
  '😻',
]

const TimeInputDemo = () => {
  const [time, setTime] = useState<string | null>(null)
  return (
    <Field
      label="Time Input V2"
      className="flex flex-col items-start gap-2"
      subtext={time || 'No time selected'}
    >
      <TimeInput value={time} onChange={setTime} />
    </Field>
  )
}

type EventExample = {
  title: string
  category?: { icon: string; color: string }
}

export default function SandboxPage() {
  const [eventExamples, setEventExamples] = useState<EventExample[]>([])

  const [toggle, setToggle] = useState(false)

  useEffect(() => {
    setEventExamples([
      ...CategoryColors.map((color) => ({
        title: Math.random().toString(36).substring(2, 4),
        category: {
          icon: randomFromArray(randomEmojis),
          color,
        },
      })),
      {
        title: Math.random().toString(36).substring(2, 7).toUpperCase(),
        category: undefined,
      },
    ])
  }, [])

  return (
    <main className="container mx-auto px-4 pb-64">
      <Header1 className="pb-12 pt-4">Sandbox</Header1>
      <div className="flex flex-col gap-4 px-4">
        <ul className="flex flex-col gap-1">
          {eventExamples.map((event) => (
            <li key={event.title} className="flex items-center gap-2">
              <CategoryIcon
                size="lg"
                color={event.category?.color}
                icon={event.title[0] || ''}
              />
              <CategoryIcon
                size="sm"
                color={event.category?.color}
                icon={event.title[0] || ''}
              />
            </li>
          ))}
        </ul>
        <div className="flex flex-col items-start gap-2">
          <div className="flex gap-2">
            <Button intent="primary">Primary</Button>
            <SubmitButton intent="primary" loading>
              Primary
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="secondary">Secondary</Button>
            <SubmitButton intent="secondary" loading>
              Secondary
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="tertiary">Tertiary</Button>
            <SubmitButton intent="tertiary" loading>
              Tertiary
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="danger">Danger</Button>
            <SubmitButton intent="danger" loading>
              Danger
            </SubmitButton>
          </div>
          <div className="flex gap-2">
            <Button intent="success">Success</Button>
            <SubmitButton intent="success" loading>
              Success
            </SubmitButton>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Input />
          <InputField label="A Normal Field" width="full" />
          <InputField
            label="A Required Field"
            condition="required"
            width="full"
          />
          <InputField
            label="An Optional Field"
            condition="optional"
            width="full"
            error="Something gone wrong"
          />
        </div>
        <div className="flex flex-col items-start gap-2">
          <Field id="my-select" label="Some Select">
            <Select
              id="my-select"
              width="full"
              name="my-select"
              options={[
                { name: 'hello', value: 'world' },
                { name: 'foo', value: 'bar' },
                { name: 'baz', value: 'baz' },
              ]}
            />
          </Field>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Field id="my-switch" label="My Switch">
            <Switch
              id="my-switch"
              checked={toggle}
              onCheckedChange={(value) => setToggle(value)}
            />
          </Field>
        </div>
        <div className="flex flex-col items-start gap-2">
          <Label>Date Picker</Label>
          <UncontrolledDatePicker name="my-date-picker" />
        </div>
        <div className="flex flex-col items-start gap-2">
          <Label>Skeleton Text</Label>
          <SkeletonText skeletonized={toggle}>
            Use above toggle to skeletonize
          </SkeletonText>
        </div>
        <Field label="Date Range Picker">
          <UncontrolledDateRangePicker />
        </Field>
        <TimeInputDemo />
      </div>
    </main>
  )
}
