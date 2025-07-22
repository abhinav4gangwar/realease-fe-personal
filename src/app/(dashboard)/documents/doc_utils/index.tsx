import { Document } from "@/types/document.types"

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

  