export interface Document {
  id: string
  name: string
  linkedProperty: string
  dateAdded: string
  dateModified: string
  lastOpened: string
  tags: string
  fileType: string
  category: "documents" | "files"
  icon: string
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
