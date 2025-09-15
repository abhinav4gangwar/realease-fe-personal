'use client'

import { Button } from '@/components/ui/button'
import { apiClient } from '@/utils/api'
import { File, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { FileIcon } from '../../documents/_components/file-icon'

interface FileItem {
  file: File
  name: string
  size: number
}

const getFileType = (fileName: string) => {
  return fileName.split(".").pop()?.toLowerCase() ?? "file"
}

interface PropertyUploadDropzoneProps {
  propertyId: string | null
  onUploadComplete: () => void
}

export function PropertyUploadDropzone({
  propertyId,
  onUploadComplete,
}: PropertyUploadDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
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

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
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
      setSelectedFiles((prev) => [...prev, ...fileItems])
    }
  }, [])

  const handleFilesFromInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const fileItems: FileItem[] = files.map((file) => ({
        file,
        name: file.name,
        size: file.size,
      }))
      setSelectedFiles((prev) => [...prev, ...fileItems])
    }
    event.target.value = ''
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    if (!propertyId) {
      toast.error('Property ID not found')
      return
    }

    try {
      setIsLoading(true)

      const formData = new FormData()

      // Add files to form data
      selectedFiles.forEach(({ file }) => {
        formData.append('files', file)
      })

      // Add metadata
      const metadata = selectedFiles.map(({ name }) => ({
        name: name,
        path: name,
        propertyId: propertyId,
        tags: '',
      }))

      formData.append('meta', JSON.stringify(metadata))
      formData.append('parentId', '') // No parent folder for property documents

      const response = await apiClient.post(
        '/dashboard/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      toast.success(response.data.message || 'Documents uploaded successfully!')
      setSelectedFiles([])
      onUploadComplete()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    onUploadComplete()
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
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="hover:bg-secondary h-11 flex-1 cursor-pointer hover:text-white"
              disabled={isLoading}
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isLoading}
              className="bg-primary hover:bg-secondary h-11 flex-1 cursor-pointer"
            >
              {isLoading
                ? 'Uploading...'
                : `Upload ${selectedFiles.length} Files`}
            </Button>
          </div>
        </div>
      )}

      {selectedFiles.length === 0 && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="hover:bg-secondary h-11 cursor-pointer hover:text-white"
          >
            Skip Document Upload
          </Button>
        </div>
      )}
    </div>
  )
}
