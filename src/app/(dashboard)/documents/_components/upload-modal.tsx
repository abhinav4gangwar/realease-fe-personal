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
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  addType: 'uploadFile' | 'uploadFolder' | 'createFolder'
}

export const createFolderSchema = z.object({
  value: z.string(),
})

export function UploadModal({ isOpen, addType, onClose }: UploadModalProps) {
  if (!isOpen) return null
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  type createFolderFormValues = z.infer<typeof createFolderSchema>

  const form = useForm<createFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      value: '',
    },
  })

  const onSubmit = async (values: createFolderFormValues) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/dashboard/documents/new-folder', {
        name: values.value,
        parentId: ""
      })
      if(response.data.message) {
        toast.success(response.data.message)
      }
      router.refresh()
      onClose()
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Folder creation failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const title =
    addType === 'uploadFile'
      ? 'Upload File'
      : addType === 'uploadFolder'
        ? 'Upload Folder'
        : 'Create New Folder'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="mx-4 max-h-[80vh] w-full max-w-2xl rounded-lg border-2 border-gray-300 bg-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          {addType === 'createFolder' && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" mx-6 pb-10"
              >
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex justify-between py-4'>
                  <Button
                    className="bg-white text-secondary border-secondary border hover:text-white text-md h-13 w-[40%] py-3 hover:bg-[#4E4F54]"
                    onClick={onClose}
                  >
                   Cancel
                  </Button>

                  <Button
                    type="submit"
                    className="bg-primary text-md h-13 py-3 hover:bg-[#4E4F54] w-[40%]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}