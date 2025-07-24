"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileItem } from "@/lib/file-upload-utils"
import { ArrowLeft } from "lucide-react"
import { FileIcon } from "./file-icon"

interface FileDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  currentViewItems: FileItem[]
  folderPath: string[]
  handleBackClick: () => void
  handleFolderClick: (folder: FileItem) => void
  updateFileMetadata: (path: string, field: "propertyId" | "tags", value: string) => void
  handleSave: () => void
  isLoading: boolean
}

const properties = [{ id: "0", name: "Test Property" }]
const getFileType = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) return "folder"
    return fileName.split('.').pop()?.toLowerCase() ?? 'file';
}

export function FileDetailsDialog({ isOpen, onOpenChange, currentViewItems, folderPath, handleBackClick, handleFolderClick, updateFileMetadata, handleSave, isLoading }: FileDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {folderPath.length > 0 && <Button variant="ghost" size="sm" onClick={handleBackClick}><ArrowLeft className="h-4 w-4" /></Button>}
            Edit Details {folderPath.length > 0 && <span className="text-sm text-muted-foreground">/ {folderPath.join(" / ")}</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-3 gap-4 p-2 border-b font-medium sticky top-0 bg-background">
            <div>Name</div>
            <div>Linked Property</div>
            <div>Tag</div>
          </div>
          <div className="space-y-1 mt-1">
            {currentViewItems.map((item) => (
              <div key={item.path} className="grid grid-cols-3 gap-4 p-2 border-b items-center">
                <div className="flex items-center gap-2 truncate">
                  <FileIcon type={getFileType(item.name, item.isDirectory)} />
                  {item.isDirectory ? <button className="text-left hover:text-blue-600 truncate" onClick={() => handleFolderClick(item)}>{item.name}</button> : <span className="truncate">{item.name}</span>}
                </div>
                {!item.isDirectory ? (<>
                  <Select value={item.propertyId || "0"} onValueChange={(v) => updateFileMetadata(item.path, "propertyId", v)}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>{properties.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input placeholder="Add Tag" value={item.tags || ""} onChange={(e) => updateFileMetadata(item.path, "tags", e.target.value)} />
                </>) : (<><div/><div/></>)}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>{isLoading ? "Uploading..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}