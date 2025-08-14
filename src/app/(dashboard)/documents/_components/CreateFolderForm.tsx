'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/utils/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name cannot be empty.'),
})
type CreateFolderFormValues = z.infer<typeof createFolderSchema>

interface CreateFolderFormProps {
  onSuccess?: () => Promise<void> | void
  onClose: () => void
  currentFolderId?: string | null
  onFolderCreated?: (id: string, name: string) => void
}

export function CreateFolderForm({
  onClose,
  onSuccess,
  currentFolderId,
  onFolderCreated,
}: CreateFolderFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: '' },
  })

  const onSubmit = async (values: CreateFolderFormValues) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/dashboard/documents/new-folder', {
        name: values.name,
        parentId: currentFolderId || null,
      })
      const newFolderId = response.data.folder.id.toString()
      toast.success(response.data.message || 'Folder created successfully')
      if (onSuccess) await onSuccess()
      if (onFolderCreated) onFolderCreated(newFolderId, values.name)
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Folder creation failed.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter folder name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
