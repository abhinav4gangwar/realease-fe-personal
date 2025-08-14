'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Document } from '@/types/document.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { BreadcrumbNavigation } from './breadcrumb-navigation'
import { FileIcon } from './file-icon'

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name cannot be empty.'),
})
type CreateFolderFormValues = z.infer<typeof createFolderSchema>

interface MoveDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  document: Document | null
  availableFolders: Document[]
  onMove: (documentId: string, newParentId: string | null) => Promise<void>
  selectedDocumentIds?: string[]
  apiClient: any
  transformApiResponse: (apiData: any) => Document[]
}

export function MoveDocumentModal({
  isOpen,
  onClose,
  document,
  onMove,
  selectedDocumentIds = [],
  apiClient,
  transformApiResponse,
}: MoveDocumentModalProps) {
  const [currentPath, setCurrentPath] = useState<
    { id: string | null; name: string }[]
  >([{ id: null, name: 'Documents' }])
  const [currentContents, setCurrentContents] = useState<Document[]>([])
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (isOpen) {
      setCurrentPath([{ id: null, name: 'Documents' }])
      setSelectedFolderId(null)
      fetchContents(null)
      setIsCreatingFolder(false)
      form.reset()
    }
  }, [isOpen])

  const fetchContents = async (parentId: string | null) => {
    setLoading(true)
    const url = `/dashboard/documents/list${parentId ? `?parentId=${parentId}` : ''}`
    try {
      const response = await apiClient.get(url)
      let contents = transformApiResponse(response.data).filter(
        (doc) => doc.isFolder
      )
      contents = contents.filter((folder) => {
        if (document && document.id !== 'bulk' && folder.id === document.id)
          return false
        if (selectedDocumentIds.includes(folder.id)) return false
        return true
      })
      setCurrentContents(contents)
    } catch (error) {
      console.error('Error fetching folder contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId === selectedFolderId ? null : folderId)
  }

  const handleFolderClick = async (folderId: string, folderName: string) => {
    setCurrentPath((prev) => [...prev, { id: folderId, name: folderName }])
    setSelectedFolderId(null)
    await fetchContents(folderId)
  }

  const handleBreadcrumbNavigate = (index: number) => {
    setCurrentPath((prev) => prev.slice(0, index + 1))
    setSelectedFolderId(null)
    fetchContents(currentPath[index].id)
  }

  const handleMove = async () => {
    if (!document) return
    setIsMoving(true)
    try {
      await onMove(document.id, selectedFolderId)
      onClose()
    } catch (error) {
      console.error('Error moving document:', error)
    } finally {
      setIsMoving(false)
    }
  }

  const handleFolderCreated = async (values: CreateFolderFormValues) => {
    try {
      const response = await apiClient.post('/dashboard/documents/new-folder', {
        name: values.name,
        parentId: currentPath[currentPath.length - 1].id || null,
      })
      const newFolderId = response.data.folder.id.toString()
      const newFolder: Document = {
        id: newFolderId,
        name: values.name,
        isFolder: true,
        icon: 'folder',
        linkedProperty: '',
        dateAdded: response.data.folder.modifiedOn || new Date().toISOString(),
        tags: '',
        fileType: 'folder',
        children: [],
      }
      setCurrentContents((prev) => [...prev, newFolder])
      setSelectedFolderId(newFolderId)
      toast.success(response.data.message || 'Folder created successfully')
      setIsCreatingFolder(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Folder creation failed.')
    }
  }

  const headerTitle = isCreatingFolder ? 'Create New Folder' : 'Move Docs'

  if (!isOpen || !document) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
      <div className="flex max-h-[80vh] w-full max-w-5xl flex-col rounded-lg border border-gray-400 bg-white px-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <h2 className="text-secondary text-lg font-semibold">
            {headerTitle}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto rounded-md border border-gray-400 p-6 mb-6">
          {isCreatingFolder ? (
            <div className="space-y-4 p-6">
              <form
                onSubmit={form.handleSubmit(handleFolderCreated)}
                className="space-y-4"
              >
                <div>
                  <Input
                    placeholder="Enter folder name..."
                    {...form.register('name')}
                    className={
                      form.formState.errors.name ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreatingFolder(false)
                      form.reset()
                    }}
                    className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
                  >
                    {form.formState.isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <BreadcrumbNavigation
                  items={currentPath.map((p) => ({ name: p.name }))}
                  onNavigate={handleBreadcrumbNavigate}
                />
              </div>
              {loading ? (
                <div className="py-4 text-center">Loading...</div>
              ) : (
                <div className="space-y-1">
                 
                  

                  {/* Root Folder */}
                  <div
                    className={`grid cursor-pointer grid-cols-12 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
                      selectedFolderId === null
                        ? 'border border-blue-200 bg-blue-50'
                        : ''
                    }`}
                    onClick={() => handleFolderSelect(null)}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FileIcon type="folder" />
                      </div>
                      <span className="truncate text-sm font-medium">
                        Move to Default
                      </span>
                    </div>
                  </div>

                  {/* Folder Rows */}
                  {currentContents.map((folder) => (
                    <div
                      key={folder.id}
                      className={`grid cursor-pointer grid-cols-12 items-center px-4 py-3 hover:rounded-md hover:bg-[#A2CFE333] ${
                        selectedFolderId === folder.id
                          ? 'border border-blue-200 bg-blue-50'
                          : ''
                      }`}
                    >
                      <div
                        className="col-span-11 flex items-center gap-3"
                        onClick={() => handleFolderSelect(folder.id)}
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon type="folder" />
                        </div>
                        <span className="truncate text-sm font-medium">
                          {folder.name}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleFolderClick(folder.id, folder.name)
                          }
                          className="h-6 w-6 hover:text-primary cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {currentContents.length === 0 && (
                    <div className="py-4 text-center text-[#9B9B9D]">
                      No folders
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between py-6 ${isCreatingFolder ? 'hidden' : ''}`}
        >
          <Button
            variant="outline"
            className="hover:bg-secondary h-11 cursor-pointer bg-transparent px-6 hover:text-white"
            onClick={() => setIsCreatingFolder(true)}
          >
            Create Folder
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="hover:bg-secondary h-11 cursor-pointer bg-transparent px-6 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={isMoving || selectedFolderId === undefined}
              className="bg-primary hover:bg-secondary h-11 cursor-pointer px-6"
            >
              {isMoving ? 'Moving...' : 'Move Here'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
