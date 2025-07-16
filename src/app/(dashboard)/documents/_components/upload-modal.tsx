"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/utils/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, File, Folder, Upload, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { FileIcon } from "./file-icon"


interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  addType: "uploadFile" | "createFolder"
}

interface FileItem {
  name: string
  path: string
  size: number
  type: string
  isDirectory: boolean
  children?: FileItem[]
  file?: File
  propertyId?: string
  tags?: string
}

interface FileMetadata {
  name: string
  path: string
  propertyId: string
  tags: string
}

export const createFolderSchema = z.object({
  value: z.string(),
})

const getFileType = (fileName: string, isDirectory: boolean) => {
  if (isDirectory) return "folder"
  const extension = fileName.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "pdf":
      return "pdf"
    case "doc":
    case "docx":
      return "word"
    case "xls":
    case "xlsx":
      return "excel"
    case "ppt":
    case "pptx":
      return "powerpoint"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return "img"
    default:
      return "kml"
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

const properties = [
  { id: "0", name: "General" },
  { id: "1", name: "Finance" },
  { id: "2", name: "HR" },
  { id: "3", name: "Marketing" },
  { id: "4", name: "Legal" },
]

export function UploadModal({ isOpen, addType, onClose }: UploadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])
  const [showUploadQueue, setShowUploadQueue] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null)
  const [folderPath, setFolderPath] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  type createFolderFormValues = z.infer<typeof createFolderSchema>

  const form = useForm<createFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      value: "",
    },
  })

  const onSubmit = async (values: createFolderFormValues) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post("/dashboard/documents/new-folder", {
        name: values.value,
        parentId: "",
      })
      if (response.data.message) {
        toast.success(response.data.message)
      }
      router.refresh()
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Folder creation failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Recursive function to read directory entries
  const readDirectoryRecursively = async (directoryEntry: any, path = ""): Promise<FileItem[]> => {
    return new Promise((resolve, reject) => {
      const items: FileItem[] = []
      const reader = directoryEntry.createReader()
      const readEntries = () => {
        reader.readEntries(
          async (entries: any[]) => {
            if (entries.length === 0) {
              resolve(items)
              return
            }
            try {
              for (const entry of entries) {
                const fullPath = path ? `${path}/${entry.name}` : entry.name
                if (entry.isDirectory) {
                  const children = await readDirectoryRecursively(entry, fullPath)
                  items.push({
                    name: entry.name,
                    path: fullPath,
                    size: 0,
                    type: "directory",
                    isDirectory: true,
                    children,
                    propertyId: undefined,
                    tags: undefined,
                  })
                } else if (entry.isFile) {
                  const file = await new Promise<File>((resolve, reject) => {
                    entry.file(
                      (file: File) => resolve(file),
                      (error: any) => reject(error),
                    )
                  })
                  items.push({
                    name: entry.name,
                    path: fullPath,
                    size: file.size,
                    type: file.type,
                    isDirectory: false,
                    file,
                    propertyId: "0",
                    tags: "",
                  })
                }
              }
              readEntries()
            } catch (error) {
              console.error("Error processing entries:", error)
              reject(error)
            }
          },
          (error: any) => {
            console.error("Error reading entries:", error)
            reject(error)
          },
        )
      }
      readEntries()
    })
  }

  // Process dropped items using webkitGetAsEntry with fallback
  const processDroppedItems = async (items: DataTransferItemList): Promise<FileItem[]> => {
    const fileItems: FileItem[] = []
    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry()
          if (entry) {
            if (entry.isDirectory) {
              const children = await readDirectoryRecursively(entry, entry.name)
              fileItems.push({
                name: entry.name,
                path: entry.name,
                size: 0,
                type: "directory",
                isDirectory: true,
                children,
                propertyId: undefined,
                tags: undefined,
              })
            } else if (entry.isFile) {
              const file = await new Promise<File>((resolve, reject) => {
                ;(entry as any).file(
                  (file: File) => resolve(file),
                  (error: any) => reject(error),
                )
              })
              fileItems.push({
                name: entry.name,
                path: entry.name,
                size: file.size,
                type: file.type,
                isDirectory: false,
                file,
                propertyId: "0",
                tags: "",
              })
            }
          }
        } else {
          const file = item.getAsFile()
          if (file) {
            fileItems.push({
              name: file.name,
              path: file.name,
              size: file.size,
              type: file.type,
              isDirectory: false,
              file,
              propertyId: "0",
              tags: "",
            })
          }
        }
      }
    } catch (error) {
      console.error("Error processing dropped items:", error)
      return []
    }
    return fileItems.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })
  }

  // Fallback for regular file uploads
  const buildFileTree = (files: File[]): FileItem[] => {
    const tree: { [key: string]: FileItem } = {}
    files.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.name
      const parts = relativePath.split("/").filter((part) => part.length > 0)
      if (parts.length === 1) {
        const fileName = parts[0]
        tree[fileName] = {
          name: fileName,
          path: fileName,
          size: file.size,
          type: file.type,
          isDirectory: false,
          file: file,
          propertyId: "0",
          tags: "",
        }
        return
      }
      let currentLevel = tree
      let currentPath = ""
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1
        currentPath = currentPath ? `${currentPath}/${part}` : part
        if (!currentLevel[part]) {
          currentLevel[part] = {
            name: part,
            path: currentPath,
            size: isLast ? file.size : 0,
            type: isLast ? file.type : "directory",
            isDirectory: !isLast,
            children: !isLast ? {} : undefined,
            file: isLast ? file : undefined,
            propertyId: isLast ? "0" : undefined,
            tags: isLast ? "" : undefined,
          }
        }
        if (!isLast && currentLevel[part].children) {
          currentLevel = currentLevel[part].children as { [key: string]: FileItem }
        }
      })
    })

    const convertToArray = (obj: { [key: string]: FileItem }): FileItem[] => {
      return Object.values(obj)
        .map((item) => ({
          ...item,
          children: item.children ? convertToArray(item.children as { [key: string]: FileItem }) : undefined,
        }))
        .sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1
          if (!a.isDirectory && b.isDirectory) return 1
          return a.name.localeCompare(b.name)
        })
    }
    return convertToArray(tree)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const newTree = buildFileTree(files)
      setUploadedFiles(newTree)
      setShowUploadQueue(true)
    }
    event.target.value = ""
  }

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const newTree = buildFileTree(files)
      setUploadedFiles(newTree)
      setShowUploadQueue(true)
    }
    event.target.value = ""
  }

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any, event: any) => {
    let items: FileItem[] = []
    if (event.dataTransfer && event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      try {
        items = await processDroppedItems(event.dataTransfer.items)
      } catch (error) {
        console.error("webkitGetAsEntry failed:", error)
        items = []
      }
    }
    if (items.length === 0 && acceptedFiles.length > 0) {
      items = buildFileTree(acceptedFiles)
    }
    setUploadedFiles(items)
    setShowUploadQueue(true)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
  })

  const openFileDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const openFolderDialog = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    folderInputRef.current?.click()
  }

  const getAllFiles = (items: FileItem[]): FileItem[] => {
    const files: FileItem[] = []
    const traverse = (items: FileItem[]) => {
      items.forEach((item) => {
        if (item.isDirectory && item.children) {
          traverse(item.children)
        } else if (!item.isDirectory) {
          files.push(item)
        }
      })
    }
    traverse(items)
    return files
  }

  const getCurrentFiles = (): FileItem[] => {
    if (currentFolder && currentFolder.children) {
      return currentFolder.children
    }
    return uploadedFiles
  }

  const handleFolderClick = (folder: FileItem) => {
    setCurrentFolder(folder)
    setFolderPath([...folderPath, folder.name])
  }

  const handleBackClick = () => {
    if (folderPath.length === 1) {
      setCurrentFolder(null)
      setFolderPath([])
    } else {
      const newPath = folderPath.slice(0, -1)
      setFolderPath(newPath)
      let targetFolder: FileItem | null = null
      let currentLevel = uploadedFiles
      for (const pathPart of newPath) {
        const folder = currentLevel.find((item) => item.name === pathPart && item.isDirectory)
        if (folder && folder.children) {
          targetFolder = folder
          currentLevel = folder.children
        }
      }
      setCurrentFolder(targetFolder)
    }
  }

  const updateFileMetadata = (path: string, field: "propertyId" | "tags", value: string) => {
    const updateInTree = (items: FileItem[]): FileItem[] => {
      return items.map((item) => {
        if (item.path === path) {
          return { ...item, [field]: value }
        }
        if (item.children) {
          return { ...item, children: updateInTree(item.children) }
        }
        return item
      })
    }
    setUploadedFiles(updateInTree(uploadedFiles))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const allFiles = getAllFiles(uploadedFiles)
      const formData = new FormData()

      console.log(allFiles)

      allFiles.forEach((fileItem, index) => {
      
        if (fileItem.file) {
            console.log(fileItem.name)
          formData.append("files", fileItem.file)
          formData.append(`metadata[${index}][name]`, fileItem.name)
          formData.append(`metadata[${index}][path]`, fileItem.path)
          formData.append(`metadata[${index}][propertyId]`, fileItem.propertyId || "0")
          formData.append(`metadata[${index}][tags]`, fileItem.tags || "")
        }

      })

     console.log(formData)
      const response = await apiClient.post("/dashboard/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.message) {
        toast.success(response.data.message)
      }

      router.refresh()
      setShowUploadQueue(false)
      setShowDetailsDialog(false)
      setUploadedFiles([])
      setCurrentFolder(null)
      setFolderPath([])
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Upload failed. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const totalFiles = getAllFiles(uploadedFiles).length
  const totalFolders = uploadedFiles.filter((item) => item.isDirectory).length

  const title = addType === "uploadFile" ? "Upload Docs" : "Create New Folder"

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="mx-4 max-h-[80vh] w-full max-w-2xl rounded-lg border-2 border-gray-300 bg-white shadow-lg">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div>
              {addType === "createFolder" && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mx-6 pb-10">
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between py-4">
                      <Button
                        className="text-secondary border-secondary text-md h-13 w-[40%] border bg-white py-3 hover:bg-[#4E4F54] hover:text-white"
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary text-md h-13 w-[40%] py-3 hover:bg-[#4E4F54]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating..." : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              {addType === "uploadFile" && (
                <div className="mx-6 pb-10">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onClick={openFolderDialog}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    {isDragActive ? (
                      <p className="text-lg font-medium">Drop the files here...</p>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">
                          Drag & drop files or folders here, or click to select folders
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports multiple files and entire folder structures
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <input
                    ref={folderInputRef}
                    type="file"
                    {...({ webkitdirectory: "" } as any)}
                    multiple
                    onChange={handleFolderUpload}
                    style={{ display: "none" }}
                  />
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={openFileDialog} className="flex-1 bg-transparent">
                      <File className="h-4 w-4 mr-2" />
                      Select Files
                    </Button>
                    <Button variant="outline" onClick={openFolderDialog} className="flex-1 bg-transparent">
                      <Folder className="h-4 w-4 mr-2" />
                      Select Folder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Queue Dialog */}
      <Dialog open={showUploadQueue} onOpenChange={setShowUploadQueue}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Upload Queue ({totalFolders} Folder & {totalFiles} Files)
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="space-y-2">
              {uploadedFiles.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <FileIcon type={getFileType(item.name, item.isDirectory)} />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!item.isDirectory && (
                      <span className="text-sm text-muted-foreground">{formatFileSize(item.size)}</span>
                    )}
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={openFolderDialog}>
              Upload More
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowUploadQueue(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowDetailsDialog(true)}>Add Details</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {folderPath.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBackClick}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              Edit and Add Details ({totalFolders} Folder & {totalFiles} Files)
              {folderPath.length > 0 && (
                <span className="text-sm text-muted-foreground">/ {folderPath.join(" / ")}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-3 gap-4 p-2 border-b font-medium">
              <div>Name</div>
              <div>Linked Property</div>
              <div>Tag</div>
            </div>
            <div className="space-y-2 mt-2">
              {getCurrentFiles().map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-2 border-b items-center">
                  <div className="flex items-center gap-2">
                    <FileIcon type={getFileType(item.name, item.isDirectory)} />
                    {item.isDirectory ? (
                      <button className="text-left hover:text-blue-600" onClick={() => handleFolderClick(item)}>
                        {item.name}
                      </button>
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </div>
                  {!item.isDirectory && (
                    <>
                      <Select
                        value={item.propertyId || "0"}
                        onValueChange={(value) => updateFileMetadata(item.path, "propertyId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add Property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map((prop) => (
                            <SelectItem key={prop.id} value={prop.id}>
                              {prop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Add Tag"
                        value={item.tags || ""}
                        onChange={(e) => updateFileMetadata(item.path, "tags", e.target.value)}
                      />
                    </>
                  )}
                  {item.isDirectory && (
                    <>
                      <div></div>
                      <div></div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Uploading..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
