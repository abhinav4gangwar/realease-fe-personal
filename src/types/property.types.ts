export interface uploadedDocuments {
  doc_id: string
  name: string
  icon: string
  fileType?: string
  size?: number | null
}
export interface Properties {
  id?: string
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
  country?: string
  district?: string
  state?: string
  city?: string
  zipcode?: string
  coordinates?: string
  latitude?: string
  longitude?: string
  valuePerSQ?: string
  additionalDetails?: Record<string, any>
  documents?: uploadedDocuments[]
}

export type PropertySortField =
  | 'name'
  | 'dateAdded'
  | 'fileType'
  | 'owner'
  | 'value'
export type PropertySortOrder = 'asc' | 'desc'

export interface FilterState {
  owners: string[]
  locations: string[]
  propertyTypes: string[]
  legalStatuses: string[]
}

export type FilterCategory =
  | 'owners'
  | 'locations'
  | 'propertyTypes'
  | 'legalStatuses'

export interface FilterOption {
  key: FilterCategory
  label: string
  field: keyof Properties
}

export const filterCategories: FilterOption[] = [
  { key: 'owners', label: 'Owner', field: 'owner' },
  { key: 'locations', label: 'Location', field: 'location' },
  { key: 'propertyTypes', label: 'Property Type', field: 'type' },
  { key: 'legalStatuses', label: 'Legal Status', field: 'legalStatus' },
]

export interface CountryType {
  name: string
  isoCode: string
}

export interface StateType {
  name: string
  isoCode: string
  countryCode: string
}

export interface CityType {
  name: string
  stateCode: string
  countryCode: string
}

export interface Comment {
  id: number
  propertyId: number
  parentId: number
  deleted: boolean
  mentions: Array<{
    name: string
    email: string
    userId: number
    userType: string
    mentionText: string
  }>
  author: number
  text: string
  createdAt: string
  updatedAt: string
  children?: Comment[]
}

export interface SharedUser {
  id: number
  email: string
  sharedAt: string
  expiresAt: string
  isExpired: boolean
}
