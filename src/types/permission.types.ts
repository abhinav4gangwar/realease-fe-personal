export type PermissionItem = {
  id: string
  label: string
}
export type PermissionGroup = {
  id: string
  label: string
  items: PermissionItem[]
  headerPermissionId?: string
}
export type Role = {
  id: string
  name: string
  permissions: Record<string, boolean>
}
