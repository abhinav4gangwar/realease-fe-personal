"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Document } from "@/types/document.types"
import { Download, Pencil, Save, Share2, X } from "lucide-react"
import { FileIcon } from "./file-icon"

interface DocumentDetailModalProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
}

export function DocumentDetailModal({ document, isOpen, onClose }: DocumentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [editedLinkedProperty, setEditedLinkedProperty] = useState("")

  if (!document || !isOpen) return null

  const handleEdit = () => {
    setEditedName(document.name)
    setEditedLinkedProperty(document.linkedProperty)
    setIsEditing(true)
  }

  const handleSave = () => {
    // Here you would typically save the changes to your backend
    console.log("Saving changes:", { name: editedName, linkedProperty: editedLinkedProperty })
    setIsEditing(false)
  }

  // const handleCancel = () => {
  //   setIsEditing(false)
  //   setEditedName("")
  //   setEditedLinkedProperty("")
  // }

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-white border-l shadow-lg flex flex-col border-none">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-24">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileIcon type={document.icon} className="w-5 h-6 flex-shrink-0" />
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="text-lg font-semibold border-gray-400 p-2 h-auto focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <h2 className="text-lg font-semibold truncate pl-1">{document.name}</h2>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isEditing ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={handleEdit}>
              <Pencil className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-gray-500" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Document Preview Area */}
        <div className="bg-gray-100 h-64 flex items-center justify-center m-4 rounded-lg">
          <div className="text-center">
            <FileIcon type={document.icon} className="w-16 h-20 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Document Preview</p>
          </div>
        </div>

        {/* Document Details */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Linked Property</h3>
            {isEditing ? (
              <Input
                value={editedLinkedProperty}
                onChange={(e) => setEditedLinkedProperty(e.target.value)}
                className="text-sm"
              />
            ) : (
              <p className="text-sm">{document.linkedProperty}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Date Added</h3>
            <p className="text-sm">{document.dateAdded}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Date Modified</h3>
            <p className="text-sm">{document.dateModified}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Opened</h3>
            <p className="text-sm">{document.lastOpened}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">File Type</h3>
            <p className="text-sm">{document.fileType}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Tags</h3>
            <p className="text-sm">{document.tags}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
