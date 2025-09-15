'use client'

import { Button } from '@/components/ui/button'
import { File, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { FileIcon } from '../../documents/_components/file-icon'

export interface FileItem {
  file: File
  name: string
  size: number
}

const getFileType = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase() ?? 'file'
}

interface PropertyUploadDropzoneProps {
  propertyId: string | null
  selectedFiles: FileItem[]
  setSelectedFiles: (files: FileItem[]) => void
  isLoading: boolean
}

export function PropertyUploadDropzone({
  propertyId,
  selectedFiles,
  setSelectedFiles,
  isLoading,
}: PropertyUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const fileItems: FileItem[] = files.map((file) => ({
          file,
          name: file.name,
          size: file.size,
        }))
        setSelectedFiles([...selectedFiles, ...fileItems])
      }
    },
    [selectedFiles, setSelectedFiles]
  )

  const handleFilesFromInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const fileItems: FileItem[] = files.map((file) => ({
        file,
        name: file.name,
        size: file.size,
      }))
      setSelectedFiles([...selectedFiles, ...fileItems])
    }
    event.target.value = ''
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`
  }

  return (
    <div className="py-6">
      {selectedFiles.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onClick={openFileDialog}
        >
          <div className="pointer-events-none">
            <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <>
                <p className="mb-2 text-lg font-medium">
                  Drag & drop or click to select files
                </p>
                <p className="text-muted-foreground text-sm">
                  Upload documents related to this property
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {selectedFiles.length === 0 && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesFromInput}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={openFileDialog}
              className="hover:bg-secondary h-11 flex-1 cursor-pointer transition ease-in-out hover:text-white"
              disabled={isLoading}
            >
              <File className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="">
          <h3 className="mb-3 text-lg font-semibold">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="max-h-80 overflow-auto rounded-md border border-gray-300 p-3">
            {selectedFiles.map((fileItem, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <FileIcon type={getFileType(fileItem.name)} />
                  <span className="truncate text-sm">{fileItem.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({formatFileSize(fileItem.size)})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                  disabled={isLoading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={openFileDialog}
              className="hover:bg-secondary h-11 flex-1 cursor-pointer hover:text-white"
              disabled={isLoading}
            >
              <File className="mr-2 h-4 w-4" />
              Add More Files
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
