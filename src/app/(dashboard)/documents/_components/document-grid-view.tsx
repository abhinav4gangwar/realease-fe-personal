"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Document } from "@/types/document.types"
import { Info } from "lucide-react"
import { FileIcon } from "./file-icon"

interface DocumentGridViewProps {
  documents: Document[]
  onDocumentInfo: (document: Document) => void
}

export function DocumentGridView({ documents, onDocumentInfo }: DocumentGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md hover:bg-[#A2CFE333] transition-shadow border-none rounded-sm">
          <CardContent>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileIcon type={document.icon} className="w-6 h-7" />
                <h3 className="text-md truncate">{document.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 cursor-pointer"
                onClick={() => onDocumentInfo(document)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1 text-sm text-[#9B9B9D]">
              <p className="truncate">{document.linkedProperty}</p>
              <p>{document.dateAdded}</p>
              <p className="truncate">{document.tags}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
