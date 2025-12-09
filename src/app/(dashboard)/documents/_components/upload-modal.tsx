'use client'

import { Button } from '@/components/ui/button'
import { useUploadHandler } from '@/hooks/useUploadHandler'
import { X } from 'lucide-react'
import { useState } from 'react'
import { CreateFolderForm } from './CreateFolderForm'
import { FileDetailsDialog } from './FileDetailsDialog'
import { UploadDropzone } from './UploadDropzone'
import { UploadQueueDialog } from './UploadQueueDialog'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  addType: 'uploadFile' | 'createFolder'
  onSuccess?: () => void
  currentFolderId?: string | null
}

export function UploadModal({
  isOpen,
  addType,
  onClose,
  onSuccess,
  currentFolderId,
}: UploadModalProps) {
  const [showUploadQueue, setShowUploadQueue] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const uploader = useUploadHandler({
    onSuccess: () => {
      if (onSuccess) onSuccess()
      // Reset state on successful upload
      uploader.clearQueue()
      setShowDetailsDialog(false)
    },
    onClose,
    currentFolderId,
  })

  const handleClose = () => {
    uploader.clearQueue()
    setShowUploadQueue(false)
    setShowDetailsDialog(false)
    onClose()
  }

  const handleQueueClose = (isOpen: boolean) => {
    if (!isOpen) {
      setShowUploadQueue(false)
    } else {
      setShowUploadQueue(isOpen)
    }
  }

  const handleQueueBack = () => {
    setShowUploadQueue(false)
  }

  const handleDetailsClose = (isOpen: boolean) => {
    if (!isOpen) {
      setShowDetailsDialog(false)
      setShowUploadQueue(true)
    } else {
      setShowDetailsDialog(isOpen)
    }
  }

  const handleProceed = () => {
    setShowUploadQueue(true)
  }

  if (!isOpen) return null

  if (showUploadQueue && !showDetailsDialog) {
    return (
      <UploadQueueDialog
        isOpen={showUploadQueue}
        onOpenChange={handleQueueClose}
        uploadedFiles={uploader.uploadedFiles}
        totalFiles={uploader.totalFiles}
        totalFolders={uploader.totalFolders}
        onUploadMore={() => uploader.openFolderDialog()}
        onContinue={() => {
          setShowUploadQueue(false)
          setShowDetailsDialog(true)
        }}
        onBack={handleQueueBack}
      />
    )
  }

  if (showDetailsDialog) {
    return (
      <FileDetailsDialog
        isOpen={showDetailsDialog}
        onOpenChange={handleDetailsClose}
        {...uploader}
      />
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background mx-4 w-full max-w-4xl rounded-lg border border-gray-400 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-semibold">
              {addType === 'uploadFile'
                ? 'Upload Documents'
                : 'Create New Folder'}
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

          {addType === 'createFolder' && (
            <CreateFolderForm
              onClose={handleClose}
              onSuccess={onSuccess}
              currentFolderId={currentFolderId}
            />
          )}
          {addType === 'uploadFile' && (
            <>
              {uploader.uploadedFiles.length > 0 && (
                <div className="border-t border-gray-400 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      {uploader.totalFolders > 0 &&
                        `${uploader.totalFolders} folder${uploader.totalFolders > 1 ? 's' : ''}, `}
                      {uploader.totalFiles} file
                      {uploader.totalFiles > 1 ? 's' : ''} selected
                    </p>

                    <div className='flex gap-6 items-center'>
                      <Button onClick={handleProceed} className='cursor-pointer'>Proceed to Upload</Button>
                      <Button className='bg-secondary hover:bg-secondary cursor-pointer'
                        onClick={() => uploader.clearQueue()}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <UploadDropzone {...uploader} />
            </>
          )}
        </div>
      </div>
    </>
  )
}
