"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useState } from "react"
import { apiClient } from "@/utils/api"
import { toast } from "sonner"

const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name cannot be empty."),
})
type CreateFolderFormValues = z.infer<typeof createFolderSchema>

interface CreateFolderFormProps {
  onSuccess?: () => void
  onClose: () => void
}

export function CreateFolderForm({ onClose, onSuccess }: CreateFolderFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: "" },
  })

  const onSubmit = async (values: CreateFolderFormValues) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/dashboard/documents/new-folder", { name: values.name, parentId: "" })
      toast.success(response.data.message || "Folder created successfully")
      if (onSuccess) await onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Folder creation failed.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl><Input placeholder="Enter folder name..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
        </div>
      </form>
    </Form>
  )
}