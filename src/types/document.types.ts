export interface Document {
  id: string
  name: string
  icon: string
  linkedProperty: string
  dateAdded: string
  dateModified: string
  lastOpened: string
  fileType: string
  tags: string
  isFolder: boolean
  hasChildren?: boolean
  children?: Document[]
  size?: number | null
  s3Key?: string | null
  parentId?: number | null
}
export type ViewMode = "list" | "grid"
export type SortField = "name" | "dateAdded" | "fileType"
export type SortOrder = "asc" | "desc"

export type FilterType = "none" | "property" | "type" | "recent"

export interface FilterState {
  type: FilterType
  selectedProperties: string[]
  selectedTypes: string[]
}

export interface BreadcrumbItem {
  name: string
  id?: string
}
