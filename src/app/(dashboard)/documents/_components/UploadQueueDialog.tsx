'use client'

import { Button } from '@/components/ui/button'

import { FileItem } from '@/lib/fileUploadUtils'
import { X } from 'lucide-react'
import { FileIcon } from './file-icon'

interface UploadQueueDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  uploadedFiles: FileItem[]
  totalFolders: number
  totalFiles: number
  onContinue: () => void
  onUploadMore: () => void
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`
}

const getFileType = (fileName: string, isDirectory: boolean) => {
  if (isDirectory) return 'folder'
  return fileName.split('.').pop()?.toLowerCase() ?? 'file'
}

export function UploadQueueDialog({
  isOpen,
  onOpenChange,
  uploadedFiles,
  totalFiles,
  totalFolders,
  onContinue,
  onUploadMore,
}: UploadQueueDialogProps) {
  if (!isOpen) return null

  const handleClose = () => onOpenChange(false)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background mx-4 flex max-h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-gray-400 shadow-lg">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-xl font-semibold">
              Upload Queue ({totalFolders} Folders, {totalFiles} Files)
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:text-primary h-8 w-8 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-2 p-4">
            <div className="max-h-[400px] overflow-auto rounded-md border border-gray-500 p-4">
              {uploadedFiles.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center justify-between rounded p-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon type={getFileType(item.name, item.isDirectory)} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {!item.isDirectory && (
                    <span className="text-muted-foreground text-sm">
                      {formatFileSize(item.size)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4">
            <div></div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={onContinue}
                className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
              >
                Add Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
