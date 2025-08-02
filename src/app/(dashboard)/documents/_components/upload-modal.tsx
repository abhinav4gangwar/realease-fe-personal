"use client"

import { Button } from "@/components/ui/button"
import { useUploadHandler } from "@/hooks/useUploadHandler"
import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { CreateFolderForm } from "./CreateFolderForm"
import { FileDetailsDialog } from "./FileDetailsDialog"
import { UploadDropzone } from "./UploadDropzone"
import { UploadQueueDialog } from "./UploadQueueDialog"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  addType: "uploadFile" | "createFolder"
  onSuccess?: () => void
}

export function UploadModal({ isOpen, addType, onClose, onSuccess }: UploadModalProps) {
  const [showUploadQueue, setShowUploadQueue] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  
  const uploader = useUploadHandler({ 
    onSuccess: () => {
      if(onSuccess) onSuccess();
      // Reset state on successful upload
      uploader.clearQueue();
      setShowDetailsDialog(false);
    }, 
    onClose 
  })

  useEffect(() => {
    if (uploader.uploadedFiles.length > 0 && !showDetailsDialog) {
      setShowUploadQueue(true)
    } else if (uploader.uploadedFiles.length === 0) {
      setShowUploadQueue(false)
    }
  }, [uploader.uploadedFiles.length, showDetailsDialog])

  const handleClose = () => {
    uploader.clearQueue();
    setShowUploadQueue(false);
    setShowDetailsDialog(false);
    onClose();
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="mx-4 w-full max-w-4xl rounded-lg border border-gray-400 bg-background shadow-lg">
          <div className="flex items-center justify-between  p-4">
            <h2 className="text-xl font-semibold">
              {addType === 'uploadFile' ? "Upload Documents" : "Create New Folder"}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 hover:text-primary cursor-pointer">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {addType === 'createFolder' && <CreateFolderForm onClose={handleClose} onSuccess={onSuccess} />}
          {addType === 'uploadFile' && <UploadDropzone {...uploader} />}
        </div>
      </div>
      
      <UploadQueueDialog
        isOpen={showUploadQueue}
        onOpenChange={setShowUploadQueue}
        uploadedFiles={uploader.uploadedFiles}
        totalFiles={uploader.totalFiles}
        totalFolders={uploader.totalFolders}
        onUploadMore={() => uploader.openFolderDialog()}
        onContinue={() => {
          setShowUploadQueue(false)
          setShowDetailsDialog(true)
        }}
      />
      
      <FileDetailsDialog
        isOpen={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        {...uploader}
      />
    </>
  )
}