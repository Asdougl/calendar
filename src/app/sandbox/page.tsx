'use client'

import { type FormEvent, useState } from 'react'
import { Switch } from '~/components/ui/switch'
import { Field, InputField } from '~/components/ui/Field'
import { Button, SubmitButton } from '~/components/ui/button'
import { Header1 } from '~/components/ui/headers'
import { Input } from '~/components/ui/input'
import { Select } from '~/components/ui/select'
import { UncontrolledDatePicker } from '~/components/ui/dates/DatePicker'
import { Label } from '~/components/ui/label'
import { SkeletonText } from '~/components/skeleton/Text'
import { UncontrolledDateRangePicker } from '~/components/ui/dates/DateRangePicker'
import { TimeInput } from '~/components/ui/input/time'
import { MobileTimeInput } from '~/components/ui/input/mobile-time'
import { TabSelect } from '~/components/ui/tab-select'

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

const MobileTimeInputDemo = () => {
  const [type, setType] = useState<'12' | '24'>('12' as const)
  const [time, setTime] = useState<string | null>('00:00')
  return (
    <Field
      label="Mobile Time Input"
      className="flex flex-col items-start gap-2"
      subtext={time || 'No time selected'}
    >
      <MobileTimeInput type={type} value={time} onChange={setTime} />
      <Switch
        checked={type === '12'}
        onCheckedChange={() => setType((type) => (type === '12' ? '24' : '12'))}
      />
    </Field>
  )
}

const TAB_OPTIONS = [
  { label: 'Foo', value: 'foo' },
  { label: 'Bar', value: 'bar' },
  { label: 'Baz', value: 'baz' },
] as const

const TabSelectDemo = () => {
  const [value, setValue] = useState('foo')

  return (
    <Field label="Tab Select" subtext={value}>
      <TabSelect
        options={TAB_OPTIONS}
        value={value}
        onChange={(value) => setValue(value)}
      />
    </Field>
  )
}

const DemoForm = () => {
  const [data, setData] = useState<Record<string, string>>({})

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    setData({
      name: (formData.get('name') as string) || 'N/A',
      email: (formData.get('email') as string) || 'N/A',
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <InputField label="Name" name="name" />
      <InputField disabled label="Email" name="email" />
      <InputField disabled label="Also Email" name="email" />
      <Button type="submit">Submit</Button>
    </form>
  )
}

export default function SandboxPage() {
  const [toggle, setToggle] = useState(false)

  return (
    <main className="container mx-auto px-4 pb-64">
      <Header1 className="pb-12 pt-4">Sandbox</Header1>
      <div className="flex flex-col gap-4 px-4">
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
        <MobileTimeInputDemo />
        <TabSelectDemo />
      </div>
      <div className="flex flex-col py-12">
        <h1 className="text-4xl">Demo Form</h1>
        <DemoForm />
      </div>
    </main>
  )
}
