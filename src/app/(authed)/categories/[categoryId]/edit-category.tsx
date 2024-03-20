'use client'

import { ArrowLeftIcon, MinusIcon } from '@heroicons/react/24/solid'
import { zodResolver } from '@hookform/resolvers/zod'
import upperFirst from 'lodash/upperFirst'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DeleteButton } from '~/components/form/DeleteButton'
import { InnerPageLayout } from '~/components/layout/PageLayout'
import { PersonModal } from '~/components/modals/PersonModal'
import { Person } from '~/components/Person'
import { Button, ButtonLink, SubmitButton } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Field } from '~/components/ui/Field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/shared'
import { CategoryColors, cn, color, isCategoryColor } from '~/utils/classnames'
import { formatError } from '~/utils/errors'
import { warn } from '~/utils/logging'
import { useNavigate } from '~/utils/nav/hooks'
import { PathLink } from '~/utils/nav/Link'
import { SEARCH_PARAM_NEW, SEARCH_PARAM_SEARCH } from '~/utils/nav/search'

type EditCategoryProps = {
  initialCategory: NonNullable<RouterOutputs['category']['one']>
}

const EditCategorySchema = z.object({
  name: z.string().min(1).max(100),
  color: z.enum(CategoryColors),
  private: z.boolean().default(false),
  hidden: z.boolean().default(false),
  sharedWith: z.array(
    z.object({
      id: z.string(),
      image: z.string().nullish(),
      name: z.string().nullish(),
    })
  ),
})

const CategorySelectColors = CategoryColors.map((color) => ({
  value: color,
  name: upperFirst(color),
  color,
}))

const EditCategoryForm = ({
  category,
}: {
  category?: EditCategoryProps['initialCategory']
}) => {
  const navigate = useNavigate()

  const queryClient = api.useUtils()

  const form = useForm<z.infer<typeof EditCategorySchema>>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      name: category?.name,
      color:
        category && isCategoryColor(category.color) ? category.color : 'gray',
      private: category?.private,
      hidden: category?.hidden,
      sharedWith:
        category?.CategoryShare.map((share) => share.sharedWith).filter(
          Boolean
        ) ?? [],
    },
  })

  const updateCategory = api.category.update.useMutation({
    onSuccess: (data) => {
      queryClient.category.all.setData(undefined, (curr) => {
        if (!curr) {
          return [data]
        }
        return [...curr.map((item) => (item.id === data.id ? data : item))]
      })
      queryClient.category.one.setData({ id: data.id }, (curr) => {
        if (!curr) {
          return data
        }
        return {
          ...curr,
          ...data,
        }
      })
      queryClient.category.all.invalidate().catch(warn)
      queryClient.category.one.invalidate({ id: data.id }).catch(warn)
      queryClient.event.invalidate().catch(warn)
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const createCategory = api.category.create.useMutation({
    onSuccess: (data) => {
      queryClient.category.all.setData(undefined, (curr) => {
        if (!curr) {
          return [data]
        }
        return [...curr, data]
      })
      queryClient.category.all.invalidate().catch(warn)
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const removeCategory = api.category.remove.useMutation({
    onSuccess: () => {
      queryClient.category.all.invalidate().catch(warn)
      queryClient.event.invalidate().catch(warn)
      navigate({ path: '/categories' })
    },
    onError: (err) => {
      form.setError('root', err)
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    const { sharedWith, ...restOfData } = data

    try {
      const shareIds = sharedWith.map((person) => person.id)

      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          shareIds,
          ...restOfData,
        })
      } else {
        await createCategory.mutateAsync({
          shareIds,
          ...restOfData,
        })
      }
      navigate({ path: '/categories' })
    } catch (error) {
      form.setError('root', { message: formatError(error) })
    }
  })

  const lockForm =
    updateCategory.isPending ||
    createCategory.isPending ||
    removeCategory.isPending ||
    form.formState.isSubmitting

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-lg flex-col gap-2 overflow-y-auto px-2"
      >
        <Field id="name" label="Name" width="full">
          <Input
            id="name"
            disabled={lockForm}
            {...form.register('name')}
            size="lg"
            className="text-center"
            width="full"
          />
        </Field>
        <Field id="color" label="Color" width="full">
          <Controller
            control={form.control}
            name="color"
            render={({ field }) => (
              <ul className="grid grid-cols-6 gap-4 rounded-lg border border-neutral-800 p-4 sm:grid-cols-9">
                {CategorySelectColors.map((categoryColor) => (
                  <li key={categoryColor.value}>
                    <input
                      type="radio"
                      id={categoryColor.value}
                      value={categoryColor.value}
                      checked={field.value === categoryColor.value}
                      onChange={() => field.onChange(categoryColor.value)}
                      className="sr-only"
                    />
                    <label
                      htmlFor={categoryColor.value}
                      className={cn(
                        'block h-8 w-8 rounded ring-neutral-50',
                        color('bg')(categoryColor.color),
                        { ring: field.value === categoryColor.color }
                      )}
                    ></label>
                  </li>
                ))}
              </ul>
            )}
          />
        </Field>
        <div className="flex flex-col gap-1">
          <div className="pl-1 text-sm group-focus-within:text-neutral-50">
            Visibility
          </div>
          <div className="flex flex-col gap-4 rounded-lg border border-neutral-800 p-4 lg:flex-row">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Controller
                control={form.control}
                name="private"
                render={({ field }) => (
                  <Checkbox
                    id="private"
                    disabled={lockForm}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                )}
              />
              <Label htmlFor="private" className="flex flex-col">
                <span className="text-base">Private</span>
                <span className="text-xs text-neutral-400">
                  Only you can see this category
                </span>
              </Label>
            </div>
            <div className="flex flex-1 items-center gap-2 px-2">
              <Controller
                control={form.control}
                name="hidden"
                render={({ field }) => (
                  <Checkbox
                    id="hidden"
                    disabled={lockForm}
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                )}
              />
              <Label htmlFor="hidden" className="flex flex-col">
                <span className="text-base">Incognito</span>
                <span className="text-xs text-neutral-400">
                  Only visible in per category view
                </span>
              </Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="pl-1 text-sm group-focus-within:text-neutral-50">
            Share
          </div>
          <div className="flex min-h-12 flex-col gap-4 rounded-lg border border-neutral-800 p-4">
            <Controller
              control={form.control}
              name="sharedWith"
              render={({ field }) => (
                <>
                  {field.value.map((sharedWith) => (
                    <Person
                      size="sm"
                      width="auto"
                      key={sharedWith.id}
                      {...sharedWith}
                    >
                      <div className="pl-2">
                        <Button
                          size="xs"
                          type="button"
                          onClick={() => {
                            form.setValue(
                              'sharedWith',
                              field.value.filter(
                                (person) => person.id !== sharedWith.id
                              )
                            )
                          }}
                          disabled={lockForm}
                        >
                          <MinusIcon height={20} />
                        </Button>
                      </div>
                    </Person>
                  ))}
                </>
              )}
            />
            <ButtonLink
              size="sm"
              path="/categories/:categoryId"
              params={{ categoryId: category?.id ?? SEARCH_PARAM_NEW }}
              query={{ person: SEARCH_PARAM_SEARCH }}
              className="flex items-center justify-center"
            >
              +
            </ButtonLink>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-12">
          {form.formState.errors.root && (
            <div className="text-red-500">
              {form.formState.errors.root.message}
            </div>
          )}
          <SubmitButton disabled={lockForm}>Save</SubmitButton>
          {category && (
            <DeleteButton
              disabled={lockForm}
              title={`Delete ${category.name}`}
              body={`Are you sure you want to delete ${category.name}? All events in this category will be uncategorized. This action cannot be undone.`}
              buttonText="Delete"
              isDeleting={removeCategory.isPending}
              onDelete={() => removeCategory.mutate({ id: category.id })}
            >
              Delete
            </DeleteButton>
          )}
        </div>
      </form>
      <PersonModal
        multiple
        initial={form.getValues('sharedWith')}
        onChoose={(people) => {
          form.setValue('sharedWith', people)
        }}
      />
    </>
  )
}

export const CreateCategory = () => {
  return (
    <InnerPageLayout
      headerLeft={
        <PathLink
          path="/categories"
          className="flex items-center justify-center"
        >
          <ArrowLeftIcon height={20} />
        </PathLink>
      }
      title={`Create Category`}
    >
      <EditCategoryForm />
    </InnerPageLayout>
  )
}

export const EditCategory = ({ initialCategory }: EditCategoryProps) => {
  const { data: category } = api.category.one.useQuery(
    {
      id: initialCategory?.id ?? '',
    },
    {
      initialData: initialCategory,
    }
  )

  if (!category) {
    return null
  }

  return (
    <InnerPageLayout
      headerLeft={
        <PathLink
          path="/categories"
          className="flex items-center justify-center"
        >
          <ArrowLeftIcon height={20} />
        </PathLink>
      }
      title={`Edit ${category.name}`}
    >
      <EditCategoryForm category={category} />
    </InnerPageLayout>
  )
}
