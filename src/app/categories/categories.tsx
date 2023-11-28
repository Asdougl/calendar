'use client'

import { type FC } from 'react'
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Popover from '@radix-ui/react-popover'
import { useSession } from 'next-auth/react'
import { SubmitButton } from '~/components/ui/button'
import { api } from '~/trpc/react'
import { type RouterInputs, type RouterOutputs } from '~/trpc/shared'
import { CategoryColors, cn, getCategoryColor } from '~/utils/classnames'
import { Input } from '~/components/ui/input'
import { time } from '~/utils/dates'
import { ErrorText } from '~/components/ui/Text'
import { createTempId } from '~/utils/misc'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { BackButton } from '~/components/BackButton'

const CategorySchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 character long'),
  color: z.string().min(1, 'Must select a valid color'),
})

type CategoryRowWithDataProps = {
  category: NonNullable<RouterOutputs['category']['all']>[number]
  update: (variables: RouterInputs['category']['update']) => void
  delete: (variables: RouterInputs['category']['remove']) => void
  isDeleting: boolean
  isUpdating: boolean
}

type CategoryRowNoDataProps = {
  create: (variables: RouterInputs['category']['create']) => void
  isCreating: boolean
}

type CategoryRowProps = CategoryRowWithDataProps | CategoryRowNoDataProps

const CategoryRow: FC<CategoryRowProps> = (props) => {
  const isUpdater = 'category' in props

  const {
    register,
    handleSubmit,
    getValues,
    control,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: isUpdater ? props.category : { color: 'gray' },
  })

  const onSubmit = handleSubmit((data) => {
    if ('update' in props) {
      props.update({
        id: props.category.id,
        name: data.name,
        color: data.color,
      })
    } else {
      props.create({
        name: data.name,
        color: data.color,
      })
    }
    reset()
  })

  const disabled = isUpdater
    ? props.isDeleting || props.isUpdating
    : props.isCreating

  return (
    <form
      onSubmit={onSubmit}
      className={cn('flex flex-col justify-between gap-1', {
        'opacity-50': isUpdater && props.category.id.includes('temp-'),
      })}
    >
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <div>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <Popover.Root>
                  <Popover.Trigger asChild>
                    <button
                      disabled={disabled}
                      className={cn(
                        'h-9 w-9 rounded-lg p-1',
                        getCategoryColor(field.value, 'bg')
                      )}
                    ></button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="grid grid-cols-6 gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-2"
                      align="start"
                    >
                      {CategoryColors.map((color) => (
                        <button
                          disabled={disabled}
                          key={color}
                          onClick={() => field.onChange(color)}
                          className={cn(
                            'h-10 w-10 flex-shrink-0 flex-grow-0 rounded-lg text-xs',
                            getCategoryColor(color, 'bg'),
                            getCategoryColor(color, 'alt-text')
                          )}
                        >
                          {color}
                        </button>
                      ))}
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            />
            {errors.color && (
              <ErrorText className="px-[2px] py-px">
                {errors.color.message}
              </ErrorText>
            )}
          </div>
          <div className="flex-grow">
            <Input
              defaultValue={getValues('name')}
              {...register('name', { required: true })}
              className="flex-grow"
              placeholder="Category name"
            />
            {errors.name && (
              <ErrorText className="px-[2px] py-px">
                {errors.name.message}
              </ErrorText>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <SubmitButton
            loading={isSubmitting}
            disabled={disabled || !isDirty}
            type="submit"
            size="md"
          >
            {isUpdater ? 'Save' : 'Create'}
          </SubmitButton>
          {isUpdater && (
            <SubmitButton
              loading={props.isDeleting}
              disabled={disabled}
              type="button"
              onClick={() => props.delete({ id: props.category.id })}
              size="md"
              intent="danger"
            >
              Delete
            </SubmitButton>
          )}
        </div>
      </div>
      {errors.root && <ErrorText>{errors.root.message}</ErrorText>}
    </form>
  )
}
export const CategoriesPage: FC = () => {
  const queryClient = api.useUtils()
  const session = useSession()

  const { data: categories } = api.category.all.useQuery(undefined, {
    // initialData: initialCategories,
    staleTime: time.minutes(5),
  })

  const { mutate: mutateCreateCategory, isLoading: isCreateLoading } =
    api.category.create.useMutation({
      onMutate: (data) => {
        const newCategory = {
          ...data,
          id: `temp-${createTempId()}`,
          icon: '❓',
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById: session.data?.user?.id ?? '',
        }
        queryClient.category.all.setData(undefined, (old) => [
          ...(old ?? []),
          newCategory,
        ])
      },
      onSuccess: () => {
        // eslint-disable-next-line no-console
        queryClient.category.all.invalidate().catch(console.warn)
      },
    })
  const { mutate: mutateUpdateCategory, isLoading: isUpdateLoading } =
    api.category.update.useMutation({
      onMutate: (data) => {
        queryClient.category.all.setData(undefined, (old) => {
          if (!old) return old
          const index = old.findIndex((c) => c.id === data.id)
          if (index === -1) return old
          const oldData = old[index]
          if (!oldData) return old
          const newCategory = {
            ...oldData,
            ...data,
            updatedAt: new Date(),
          }
          return [...old.slice(0, index), newCategory, ...old.slice(index + 1)]
        })
      },
      onSuccess: () => {
        // eslint-disable-next-line no-console
        queryClient.category.all.invalidate().catch(console.warn)
      },
    })
  const { mutate: mutateDeleteCategory, isLoading: isDeleteLoading } =
    api.category.remove.useMutation({
      onMutate: (data) => {
        queryClient.category.all.setData(undefined, (old) => {
          if (!old) return old
          const index = old.findIndex((c) => c.id === data.id)
          if (index === -1) return old
          return [...old.slice(0, index), ...old.slice(index + 1)]
        })
      },
      onSuccess: () => {
        // eslint-disable-next-line no-console
        queryClient.category.all.invalidate().catch(console.warn)
      },
    })

  return (
    <InnerPageLayout
      headerLeft={<BackButton whenLastLocation="/profile" />}
      title="Categories"
    >
      <div className="px-4">
        <ul className="flex flex-col rounded-lg border border-neutral-800">
          {categories?.map((category) => (
            <li
              key={category.id}
              className="flex flex-col border-b border-neutral-800 px-2 py-2 last:border-b-0"
            >
              <CategoryRow
                category={category}
                update={mutateUpdateCategory}
                delete={mutateDeleteCategory}
                isUpdating={isUpdateLoading}
                isDeleting={isDeleteLoading}
              />
            </li>
          ))}
          <li className="flex flex-col border-b border-neutral-800 px-2 py-2 last:border-b-0">
            <CategoryRow
              create={mutateCreateCategory}
              isCreating={isCreateLoading}
            />
          </li>
        </ul>
      </div>
    </InnerPageLayout>
  )
}
