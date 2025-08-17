"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UnifiedDocumentViewer } from "./unified-document-viewer"
import type { Document } from "@/types/document.types"

// Mock document data for testing
const mockDocuments: Document[] = [
  {
    id: "1",
    name: "sample-image.jpg",
    icon: "img",
    linkedProperty: "Test Property",
    dateAdded: "2024-01-15",
    dateModified: "2024-01-15",
    lastOpened: "2024-01-15",
    fileType: "image/jpeg",
    tags: "test, image",
    isFolder: false,
  },
  {
    id: "2", 
    name: "sample-document.pdf",
    icon: "pdf",
    linkedProperty: "Test Property",
    dateAdded: "2024-01-15",
    dateModified: "2024-01-15", 
    lastOpened: "2024-01-15",
    fileType: "application/pdf",
    tags: "test, pdf",
    isFolder: false,
  },
  {
    id: "3",
    name: "sample-presentation.png", 
    icon: "img",
    linkedProperty: "Test Property",
    dateAdded: "2024-01-15",
    dateModified: "2024-01-15",
    lastOpened: "2024-01-15", 
    fileType: "image/png",
    tags: "test, presentation",
    isFolder: false,
  }
]

// Mock API client for testing
const mockApiClient = {
  get: async (url: string, options?: any) => {
    console.log("Mock API call:", url, options)
    
    // Simulate different responses based on URL
    if (url.includes("view/1") && url.includes("original=true")) {
      // Return mock image blob
      return {
        data: new Blob(["mock image data"], { type: "image/jpeg" })
      }
    } else if (url.includes("view/2")) {
      // Return mock PDF blob
      return {
        data: new Blob(["mock pdf data"], { type: "application/pdf" })
      }
    } else if (url.includes("view/3") && url.includes("original=true")) {
      // Return mock PNG blob
      return {
        data: new Blob(["mock png data"], { type: "image/png" })
      }
    } else if (url.includes("comments/list")) {
      // Return mock comments
      return {
        data: {
          comments: []
        }
      }
    } else if (url.includes("users/list")) {
      // Return mock users
      return {
        data: [
          { id: "1", name: "Test User", email: "test@example.com" }
        ]
      }
    }
    
    return { data: null }
  },
  post: async (url: string, data: any) => {
    console.log("Mock API POST:", url, data)
    return { data: { id: Date.now(), ...data } }
  },
  put: async (url: string, data: any) => {
    console.log("Mock API PUT:", url, data)
    return { data: { success: true } }
  },
  delete: async (url: string, data: any) => {
    console.log("Mock API DELETE:", url, data)
    return { data: { success: true } }
  }
}

export function TestDocumentViewer() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document)
    setIsViewerOpen(true)
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setSelectedDocument(null)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Document Viewer Test</h1>
      
      <div className="grid gap-4 mb-6">
        <h2 className="text-lg font-semibold">Test Documents:</h2>
        {mockDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-medium">{doc.name}</h3>
              <p className="text-sm text-gray-600">Type: {doc.fileType}</p>
              <p className="text-sm text-gray-600">Tags: {doc.tags}</p>
            </div>
            <Button onClick={() => handleDocumentSelect(doc)}>
              Open Viewer
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Click "Open Viewer"</strong> for each document type</li>
          <li><strong>Text Selection (PDFs):</strong> Select text, then click comment button to open modal</li>
          <li><strong>Click-to-Annotate:</strong> Click anywhere without text - modal opens automatically</li>
          <li><strong>Zoom:</strong> Use zoom controls in bottom-right corner</li>
          <li><strong>Multi-page PDFs:</strong> Scroll to see all pages simultaneously</li>
          <li><strong>Images:</strong> Click anywhere to add point annotations instantly</li>
        </ul>

        <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <h4 className="font-medium text-blue-800">New UX Behavior:</h4>
          <p className="text-sm text-blue-700 mt-1">
            <strong>Click without text:</strong> Comment modal opens immediately<br/>
            <strong>Text selection:</strong> Must click comment button to open modal
          </p>
        </div>
      </div>

      {/* Document Viewer */}
      <UnifiedDocumentViewer
        isOpen={isViewerOpen}
        onClose={handleCloseViewer}
        document={selectedDocument}
        apiClient={mockApiClient}
        onShareClick={(doc) => console.log("Share:", doc)}
        onMoveClick={(doc) => console.log("Move:", doc)}
        onDownloadClick={(doc) => console.log("Download:", doc)}
        onEditClick={(doc) => console.log("Edit:", doc)}
      />
    </div>
  )
}
