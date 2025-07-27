import { Document } from '@/types/document.types'

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

