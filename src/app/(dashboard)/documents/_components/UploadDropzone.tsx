'use client'

import { Button } from '@/components/ui/button'
import { File, Folder, Upload } from 'lucide-react'

interface UploadDropzoneProps {
  isDragActive: boolean
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  openFileDialog: (e: React.MouseEvent) => void
  openFolderDialog: (e?: React.MouseEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  folderInputRef: React.RefObject<HTMLInputElement>
  handleFilesFromInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadDropzone({
  isDragActive,
  handleDrop,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  openFileDialog,
  openFolderDialog,
  fileInputRef,
  folderInputRef,
  handleFilesFromInput,
}: UploadDropzoneProps) {
  return (
    <div className="p-6">
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
      >
        <div className="pointer-events-none">
          <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          {isDragActive ? (
            <p className="text-lg font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="mb-2 text-lg font-medium">
                Drag & drop or click to select
              </p>
              <p className="text-muted-foreground text-sm">
                Supports files and entire folders
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesFromInput}
        style={{ display: 'none' }}
      />
      <input
        ref={folderInputRef}
        type="file"
        {...({ webkitdirectory: '' } as any)}
        multiple
        onChange={handleFilesFromInput}
        style={{ display: 'none' }}
      />

      <div className="mt-4 flex gap-3">
        <Button
          variant="outline"
          onClick={openFileDialog}
          className="hover:bg-secondary h-11 w-28 flex-1 cursor-pointer transition ease-in-out hover:text-white"
        >
          <File className="mr-2 h-4 w-4" />
          Select Files
        </Button>
        
          <Button
            variant="outline"
            onClick={openFolderDialog}
            className="hover:bg-secondary h-11 w-28 flex-1 cursor-pointer transition ease-in-out hover:text-white"
          >
            <Folder className="mr-2 h-4 w-4" />
            Select Folder
          </Button>
      </div>
    </div>
  )
}
