export interface uploadedDocuments {
  doc_id: string
  name: string
  icon: string
  fileType?: string
  size?: number | null
}
export interface Properties {
  id: string
  name: string
  location: string
  extent: string
  type: string
  owner: string
  dateAdded?: string
  isDisputed?: boolean
  legalStatus?: string
  legalParties?: string
  caseNumber?: string
  caseType?: string
  nextHearing?: string
  value?: string
  address?: string
  coordinates?: string
  valuePerSQ?: string
  documents?: uploadedDocuments[]
}

export type PropertySortField =
  | 'name'
  | 'dateAdded'
  | 'fileType'
  | 'owner'
  | 'value'
export type PropertySortOrder = 'asc' | 'desc'
