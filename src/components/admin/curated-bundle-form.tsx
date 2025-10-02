'use client'

import { useActionState, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, Save } from 'lucide-react'
import { createCuratedBundleAction, updateCuratedBundleAction } from '@/lib/actions-async'
import { useRouter } from 'next/navigation'
import { CuratedBundle, Product } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'

const curatedBundleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
  productIds: z.array(z.string()).min(1, 'At least one product must be selected'),
})

type CuratedBundleFormValues = z.infer<typeof curatedBundleFormSchema>

interface CuratedBundleFormProps {
  bundle?: CuratedBundle
  products: Product[]
}

export function CuratedBundleForm({ bundle, products }: CuratedBundleFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(
    bundle ? updateCuratedBundleAction : createCuratedBundleAction,
    { success: false, error: '' }
  )
  const [isPending, startTransition] = useTransition()

  const form = useForm<CuratedBundleFormValues>({
    resolver: zodResolver(curatedBundleFormSchema),
    defaultValues: {
      id: bundle?.id,
      name: bundle?.name || '',
      description: bundle?.description || '',
      imageUrl: bundle?.imageUrl || '',
      isActive: bundle?.isActive ?? true,
      sortOrder: bundle?.sortOrder || 0,
      productIds: bundle?.productIds || [],
    },
  })

  const onSubmit = (data: CuratedBundleFormValues) => {
    const formData = new FormData()
    
    if (data.id) {
      formData.append('id', data.id)
    }
    
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('imageUrl', data.imageUrl || '')
    formData.append('isActive', data.isActive ? 'on' : '')
    formData.append('sortOrder', data.sortOrder.toString())
    formData.append('productIds', JSON.stringify(data.productIds))
    
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundle Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Anime Favorites" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sort Order</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe this bundle..." 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Make this bundle visible to customers
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="productIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Products</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Select products to include in this bundle
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-4">
                {products.map((product) => (
                  <FormField
                    key={product.id}
                    control={form.control}
                    name="productIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={product.id}
                          className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(product.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, product.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== product.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {product.name}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {state?.error && (
          <div className="text-sm font-medium text-destructive">
            {state.error}
          </div>
        )}
        
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {bundle ? 'Update Bundle' : 'Create Bundle'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}