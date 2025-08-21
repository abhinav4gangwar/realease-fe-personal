import { FileItem, buildFileTreeFromInput, processEntry } from "@/lib/fileUploadUtils"
import { apiClient } from "@/utils/api"
import { useDropzone } from "react-dropzone"
import { useState, useCallback, useRef, useMemo } from "react"
import { toast } from "sonner"

interface UseUploadHandlerProps {
  onSuccess?: () => void
  onClose: () => void
  currentFolderId?: string | null
}

export const useUploadHandler = ({ onSuccess, onClose, currentFolderId }: UseUploadHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false) 
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([])
  const [currentFolder, setCurrentFolder] = useState<FileItem | null>(null)
  const [folderPath, setFolderPath] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer?.items) {
      const dataTransferItems = Array.from(e.dataTransfer.items)
      const topLevelEntries = dataTransferItems.map((item: any) => item.webkitGetAsEntry())
      const processedItems = await Promise.all(topLevelEntries.map((entry) => (entry ? processEntry(entry) : Promise.resolve(null))))
      const items = processedItems.filter((item): item is FileItem => item !== null)
      
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1
        if (!a.isDirectory && b.isDirectory) return 1
        return a.name.localeCompare(b.name)
      })
      
      console.log("🌳 Final file structure from D&D:", items);
      setUploadedFiles(prev => [...prev, ...items])
    }
  }, []);

  const handleFilesFromInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
        const tree = buildFileTreeFromInput(files);
        setUploadedFiles(prev => [...prev, ...tree])
    }
    event.target.value = ""
  }

  const openFileDialog = (e: React.MouseEvent) => { e.stopPropagation(); fileInputRef.current?.click() }
  const openFolderDialog = (e?: React.MouseEvent) => { e?.stopPropagation(); folderInputRef.current?.click() }

  const getAllFiles = (items: FileItem[]): FileItem[] => items.flatMap(item => item.isDirectory ? getAllFiles(item.children ?? []) : [item])
  const countFolders = (items: FileItem[]): number => items.reduce((acc, item) => acc + (item.isDirectory ? 1 + countFolders(item.children ?? []) : 0), 0)

  const totalFiles = useMemo(() => getAllFiles(uploadedFiles).length, [uploadedFiles])
  const totalFolders = useMemo(() => countFolders(uploadedFiles), [uploadedFiles])

  const handleFolderClick = (folder: FileItem) => { setCurrentFolder(folder); setFolderPath((prev) => [...prev, folder.name]) }

  const handleBackClick = () => {
    const newPath = folderPath.slice(0, -1)
    setFolderPath(newPath)
    if (newPath.length === 0) { setCurrentFolder(null); return }
    let targetFolder: FileItem | null = { children: uploadedFiles } as any
    for (const pathPart of newPath) { targetFolder = targetFolder?.children?.find((item) => item.name === pathPart) || null }
    setCurrentFolder(targetFolder)
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
    
    const newTree = updateInTree(uploadedFiles);
    setUploadedFiles(newTree);
    if (currentFolder) {
      let newCurrentFolder: FileItem | null = { children: newTree } as any;
      for (const pathPart of folderPath) {
        newCurrentFolder = newCurrentFolder?.children?.find(item => item.name === pathPart) || null;
      }
      
      if (newCurrentFolder) {
        setCurrentFolder(newCurrentFolder);
      }
    }
  }


  const handleSave = async () => {
    setIsLoading(true)
    try {
      const allFiles = getAllFiles(uploadedFiles)
      if (allFiles.length === 0) { toast.info("No files to upload."); return }
      const formData = new FormData()
      const metadata = allFiles.map((fileItem) => {
        if (fileItem.file) formData.append("files", fileItem.file)
        return { name: fileItem.name, path: fileItem.path, propertyId: fileItem.propertyId || "0", tags: fileItem.tags || "" }
      })
      formData.append("meta", JSON.stringify(metadata))
      // Add parentId to the form data
      formData.append("parentId", currentFolderId || "")
      const response = await apiClient.post("/dashboard/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
      toast.success(response.data.message || "Upload successful!")
      if (onSuccess) await onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Upload failed.")
    } finally {
      setIsLoading(false)
    }
  }

  const clearQueue = () => setUploadedFiles([])
  const currentViewItems = currentFolder?.children || uploadedFiles

  return {
    isLoading, uploadedFiles, folderPath, fileInputRef, folderInputRef, totalFiles, totalFolders,
    isDragActive,
    handleDrop, handleDragEnter, handleDragLeave, handleDragOver, 
    openFileDialog, openFolderDialog, handleFilesFromInput,
    handleFolderClick, handleBackClick, updateFileMetadata, handleSave, currentViewItems, clearQueue,
  }
}