export interface User {
  id?: string
  name: string
  email: string
}

export interface CommentAnnotation {
  id: string
  page: number
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface Comment {
  id: number
  documentId: number
  page: number | null
  parentId: number
  type: string | null
  deleted: boolean
  annotation: CommentAnnotation
  mentions: any | null
  author: number
  text: string
  createdAt: string
  updatedAt: string
  children?: Comment[]
  authorName?: string
  timestamp?: string
}

export interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  document: any | null
  apiClient: any
  onEditClick?: (document: any) => void
  onMoveClick?: (document: any) => void
  onShareClick?: (document: any) => void
  onDownloadClick?: (document: any) => void
}
