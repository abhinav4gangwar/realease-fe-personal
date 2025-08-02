import { Document } from '@/types/document.types'
import { apiClient } from '@/utils/api'
import { toast } from 'sonner'

export const getAllFolders = (documents: Document[]) => {
  const folders: Document[] = []
  const extractFolders = (docs: Document[]) => {
    docs.forEach((doc) => {
      if (doc.isFolder) {
        folders.push(doc)
        if (doc.children) {
          extractFolders(doc.children)
        }
      }
    })
  }
  extractFolders(documents)
  return folders
}

export const getFolderCounts = (folder: Document) => {
  if (!folder.children) return '0 Files'
  const folders = folder.children.filter((child) => child.isFolder).length
  const files = folder.children.filter((child) => !child.isFolder).length
  return `${folders} Folders & ${files} Files`
}

export const findFolderById = (
  folderId: string,
  documents: Document[]
): Document | null => {
  for (const doc of documents) {
    if (doc.id === folderId) {
      return doc
    }
    if (doc.children) {
      const found = findFolderById(folderId, doc.children)
      if (found) return found
    }
  }
  return null
}

export const getFileCounts = (documents: Document[]) => {
  const folders = documents.filter((doc) => doc.isFolder).length
  const files = documents.filter((doc) => !doc.isFolder).length
  return `${folders} Folders & ${files} Files`
}

export const handleDownloadClick = async (document: Document) => {
  try {
    const payload = {
      items: [
        {
          id: Number.parseInt(document.id),
          type: document.isFolder ? 'folder' : 'file',
        },
      ],
    }

    const response = await apiClient.post(
      `/dashboard/documents/download`,
      payload,
      {
        responseType: 'blob',
      }
    )

    if (response && response.data) {
      const contentType =
        response.headers['content-type'] || 'application/octet-stream'

      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)
      let filename = document.name || 'download'
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        )
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      if (document.isFolder && !filename.endsWith('.zip')) {
        filename += '.zip'
      }

      const link = window.document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      window.document.body.appendChild(link)
      link.click()

      // Cleanup
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Download started successfully!')
    } else {
      toast.error('No file data received')
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error || error?.message || 'Download failed'
    toast.error(errorMessage)
    console.log(error)
  }
}

export const handleBulkDownload = async (
  selectedDocuments: any,
  documentInfo?: { name?: string; isFolder?: boolean },
  allDocuments?: Document[] // Add this parameter to access document details
) => {
  if (selectedDocuments.length === 0) return

  try {
    // Helper function to find document by ID and determine its type
    const getDocumentType = (docId: string): 'folder' | 'file' => {
      if (!allDocuments) return 'file' // fallback

      const findDocumentRecursively = (docs: Document[]): Document | null => {
        for (const doc of docs) {
          if (doc.id === docId) return doc
          if (doc.children) {
            const found = findDocumentRecursively(doc.children)
            if (found) return found
          }
        }
        return null
      }

      const document = findDocumentRecursively(allDocuments)
      return document?.isFolder ? 'folder' : 'file'
    }

    const items = selectedDocuments.map((id: string) => ({
      id: Number.parseInt(id),
      type: getDocumentType(id),
    }))

    const response = await apiClient.post(
      `/dashboard/documents/download`,
      { items: items },
      {
        responseType: 'blob',
      }
    )

    if (response && response.data) {
      const contentType =
        response.headers['content-type'] || 'application/octet-stream'

      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)

      // Use documentInfo instead of document
      let filename = documentInfo?.name || 'download'

      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        )
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      // Use documentInfo instead of document
      if (documentInfo?.isFolder && !filename.endsWith('.zip')) {
        filename += '.zip'
      }

      const link = window.document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      window.document.body.appendChild(link)
      link.click()

      // Cleanup
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Download started successfully!')
    } else {
      toast.error('No file data received')
      toast.error('Something went wrong')
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error || error?.message || 'Download failed'
    toast.error(errorMessage)
    console.log(error)
  }
}
