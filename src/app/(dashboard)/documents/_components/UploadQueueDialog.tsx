"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileItem } from "@/lib/file-upload-utils"
import { FileIcon } from "./file-icon"

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
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${["Bytes", "KB", "MB", "GB"][i]}`
}

const getFileType = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return "folder"
    return fileName.split('.').pop()?.toLowerCase() ?? 'file';
}

export function UploadQueueDialog({ isOpen, onOpenChange, uploadedFiles, totalFiles, totalFolders, onContinue, onUploadMore }: UploadQueueDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Queue ({totalFolders} Folders, {totalFiles} Files)</DialogTitle>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-auto space-y-2 p-1">
          {uploadedFiles.map((item) => (
            <div key={item.path} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2 truncate">
                <FileIcon type={getFileType(item.name, item.isDirectory)} />
                <span className="truncate">{item.name}</span>
              </div>
              {!item.isDirectory && <span className="text-sm text-muted-foreground">{formatFileSize(item.size)}</span>}
            </div>
          ))}
        </div>
        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onUploadMore}>Upload More</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={onContinue}>Add Details</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}