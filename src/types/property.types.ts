export interface Properties {
    id: string
    name: string
    location: string
    extent: string
    type: string
    owner: string
}


export type PropertySortField = "name" | "dateAdded" | "fileType" | "owner" | "value"
export type PropertySortOrder = "asc" | "desc"
