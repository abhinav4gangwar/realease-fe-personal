"use client"

import { Button } from "@/components/ui/button"
import { File, Folder, Upload } from "lucide-react"

interface UploadDropzoneProps {
  getRootProps: any
  getInputProps: any
  isDragActive: boolean
  openFileDialog: (e: React.MouseEvent) => void
  openFolderDialog: (e?: React.MouseEvent) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  folderInputRef: React.RefObject<HTMLInputElement>
  handleFilesFromInput: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function UploadDropzone({
  getRootProps, getInputProps, isDragActive, openFileDialog, openFolderDialog,
  fileInputRef, folderInputRef, handleFilesFromInput
}: UploadDropzoneProps) {
  return (
    <div className="p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}`}
        onClick={() => openFolderDialog()}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">Drag & drop or click to select</p>
        <p className="text-sm text-muted-foreground">Supports files and entire folders</p>
      </div>

      <input ref={fileInputRef} type="file" multiple onChange={handleFilesFromInput} style={{ display: "none" }} />
      <input ref={folderInputRef} type="file" {...({ webkitdirectory: "" } as any)} multiple onChange={handleFilesFromInput} style={{ display: "none" }} />

      <div className="flex gap-3 mt-4">
        <Button variant="outline" onClick={openFileDialog} className="flex-1">
          <File className="h-4 w-4 mr-2" />Select Files
        </Button>
        <Button variant="outline" onClick={openFolderDialog} className="flex-1">
          <Folder className="h-4 w-4 mr-2" />Select Folder
        </Button>
      </div>
    </div>
  )
}