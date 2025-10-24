'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { permissionGroups } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PermissionGroup, Role } from '@/types/permission.types'
import { apiClient } from '@/utils/api'
import { Plus, Trash2, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { permissionStringToKey } from './_access-control-utils/access-conrol-utils'
import AccessControlStateToggle from './access-control-state-toggle'

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function isEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

const HeaderCell = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn('text-secondary p-4 text-sm font-semibold', className)}>
    {children}
  </div>
)

const GroupHeaderRow = ({
  group,
  roles,
}: {
  group: PermissionGroup
  roles: Role[]
}) => {
  return (
    <div className="contents">
      <div className="px-4 py-2 text-sm font-semibold">{group.label}</div>
      {roles.map((role) => (
        <div
          key={`${role.id}-${group.id}-header`}
          className="flex items-center bg-[#F8F8F8] px-10 py-2"
        ></div>
      ))}
    </div>
  )
}

export default function PermissionsList() {
  const [loading, setLoading] = useState(true)
  const [savedRoles, setSavedRoles] = useState<Role[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [addingRole, setAddingRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const newRoleInputRef = useRef<HTMLInputElement>(null)

  const dirty = useMemo(() => !isEqual(roles, savedRoles), [roles, savedRoles])

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/roles')

        if (response.data.success && response.data.data) {
          const { defaultRoles, customRoles } = response.data.data

          const sortedDefaultRoles = [...defaultRoles].sort(
            (a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)
          )

          const allApiRoles = [...sortedDefaultRoles, ...customRoles]

          const transformedRoles: Role[] = allApiRoles.map((role: any) => {
            const permissionMap: Record<string, boolean> = {}

            if (Array.isArray(role.permissions)) {
              role.permissions.forEach((perm: string) => {
                const key = permissionStringToKey(perm)
                if (key) permissionMap[key] = true
              })
            } else if (
              typeof role.permissions === 'object' &&
              role.permissions !== null
            ) {
              const permArray = Object.values(role.permissions)
              permArray.forEach((perm: any) => {
                const key = permissionStringToKey(perm)
                if (key) permissionMap[key] = true
              })
            }

            return {
              id: role.roleId,
              name: role.name,
              permissions: permissionMap,
            }
          })

          setSavedRoles(transformedRoles)
          setRoles(deepClone(transformedRoles))
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const addNewRole = async () => {
    const trimmed = newRoleName.trim()
    if (!trimmed) return

    const roleId = trimmed.toLowerCase().replace(/\s+/g, '-')

    try {
      const response = await apiClient.post('/roles', {
        roleId,
        name: trimmed,
        description: '',
        permissions: [],
      })

      if (response.data.success) {
        const apiRole = response.data.data
        const permissionMap: Record<string, boolean> = {}

        if (
          typeof apiRole.permissions === 'object' &&
          apiRole.permissions !== null
        ) {
          const permArray = Object.values(apiRole.permissions)
          permArray.forEach((perm: any) => {
            const key = permissionStringToKey(perm)
            if (key) permissionMap[key] = true
          })
        }

        const newRole: Role = {
          id: apiRole.roleId,
          name: apiRole.name,
          permissions: permissionMap,
        }

        const updated = [...roles, newRole]
        setRoles(updated)
        setSavedRoles(updated)
        toast.message(response.data.message)
      }
    } catch (error) {
      toast.error('Failed to create role', error)
    } finally {
      setNewRoleName('')
      setAddingRole(false)
    }
  }

  const togglePermission = (
    roleId: string,
    permId: string,
    checked: boolean
  ) => {
    if (roleId === 'super-admin') return
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: { ...r.permissions, [permId]: !!checked } }
          : r
      )
    )
  }

  const saveChanges = async () => {
    try {
      const changedRoles = roles.filter((role) => {
        const saved = savedRoles.find((r) => r.id === role.id)
        return saved && !isEqual(role, saved)
      })

      const updatePromises = changedRoles.map(async (role) => {
        const permissionsArray = Object.keys(role.permissions).filter(
          (key) => role.permissions[key]
        )

        const response = await apiClient.put(`/roles/${role.id}`, {
          name: role.name,
          description: '',
          permissions: permissionsArray,
        })

        return response
      })

      await Promise.all(updatePromises)

      toast.success('Roles updated successfully')
      setSavedRoles(deepClone(roles))
    } catch (error) {
      console.error('Failed to update roles:', error)
      toast.error('Failed to update roles')
    }
  }

  const cancelChanges = () => {
    setRoles(deepClone(savedRoles))
    setAddingRole(false)
    setNewRoleName('')
  }

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return

    try {
      const response = await apiClient.delete(`/roles/${roleToDelete.id}`)

      if (response.data.success) {
        const updated = roles.filter((r) => r.id !== roleToDelete.id)
        setRoles(updated)
        setSavedRoles(updated)
        toast.success(`Role "${roleToDelete.name}" deleted successfully`)
      }
    } catch (error) {
      console.error('Failed to delete role:', error)
      toast.error('Failed to delete role')
    } finally {
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setRoleToDelete(null)
  }

  if (addingRole) {
    setTimeout(() => newRoleInputRef.current?.focus(), 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-secondary text-lg">Loading roles...</div>
      </div>
    )
  }

  const firstColWidth = 'min-w-[240px]'
  const roleColWidth = 'w-[150px]'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-secondary text-2xl font-semibold lg:text-3xl">
          Roles
        </div>
        <div className="flex items-center gap-3">
          <AccessControlStateToggle />
          {dirty && (
            <Button
              variant="ghost"
              onClick={cancelChanges}
              className="h-12 cursor-pointer border border-gray-400"
            >
              Cancel
            </Button>
          )}
          <Button className="h-12" disabled={!dirty} onClick={saveChanges}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-gray-400">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `minmax(220px,1fr) ${roles.map(() => '160px').join(' ')}`,
          }}
        >
          {/* Header row */}
          <HeaderCell className={cn(firstColWidth)}>Permissions</HeaderCell>
          {roles.map((role, idx) => (
            <HeaderCell key={role.id} className={cn(roleColWidth, 'relative')}>
              <div className="group flex items-center justify-between">
                <span className="truncate">{role.name}</span>
                <div className="flex items-center">
                  {role.id !== 'super-admin' && (
                    <Button
                      aria-label={`Delete ${role.name}`}
                      className="text-gray-400 bg-transparent h-5 w-5 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent"
                      onClick={() => handleDeleteClick(role)}
                      title={`Delete ${role.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {idx === roles.length - 1 && !addingRole && (
                    <Button
                      aria-label="Add role"
                      className="text-primary hover:bg-secondary h-5 w-5 cursor-pointer rounded-full border border-gray-400 bg-white"
                      onClick={() => setAddingRole(true)}
                      title="Add role"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </HeaderCell>
          ))}

          {/* New role inline input */}
          {addingRole && (
            <div className="col-span-full col-start-2">
              <div className="flex items-center gap-2 px-4 py-2">
                <Input
                  ref={newRoleInputRef}
                  placeholder="New role name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="h-10 max-w-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addNewRole()
                    if (e.key === 'Escape') {
                      setAddingRole(false)
                      setNewRoleName('')
                    }
                  }}
                />
                <Button onClick={addNewRole} disabled={!newRoleName.trim()}>
                  Add
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setAddingRole(false)
                    setNewRoleName('')
                  }}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Body rows */}
          {permissionGroups.map((group) => (
            <div key={group.id} className="contents">
              <GroupHeaderRow group={group} roles={roles} />

              {group.items.map((item, rowIdx) => (
                <div
                  key={item.id}
                  className={cn(
                    'contents',
                    rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  )}
                >
                  <div className={cn('px-4 py-3 text-sm', firstColWidth)}>
                    {item.label}
                  </div>
                  {roles.map((role) => {
                    const isSuper = role.id === 'super-admin'
                    return (
                      <div
                        key={`${role.id}-${item.id}`}
                        className={cn(
                          'px-10 py-3',
                          roleColWidth,
                          'flex items-center'
                        )}
                      >
                        <Checkbox
                          checked={isSuper ? true : !!role.permissions[item.id]}
                          disabled={isSuper}
                          onCheckedChange={(checked) =>
                            togglePermission(role.id, item.id, Boolean(checked))
                          }
                          aria-label={`Toggle ${item.label} for ${role.name}`}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className='border border-gray-400'>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to delete the role {roleToDelete?.name} ? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className=""
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}