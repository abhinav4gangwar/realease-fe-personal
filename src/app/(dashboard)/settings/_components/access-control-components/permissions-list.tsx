'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { defaultRoles } from '@/lib/access-control.dummy'
import { permissionGroups } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PermissionGroup, Role } from '@/types/permission.types'
import { Plus, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
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
  <div
    className={cn(
      'text-secondary p-4 text-sm font-semibold',
      className
    )}
  >
    {children}
  </div>
)

const GroupHeaderRow = ({
  group,
  roles,
  onToggle,
}: {
  group: PermissionGroup
  roles: Role[]
  onToggle: (roleId: string, permId: string, checked: boolean) => void
}) => {
  const groupPermId = group.headerPermissionId ?? group.id
  return (
    <div className="contents">
      <div className="px-4 py-2 text-sm font-semibold">
        {group.label}
      </div>
      {roles.map((role) => {
        const isSuper = role.id === 'super-admin'
        const checked = !!role.permissions[groupPermId]
        return (
          <div
            key={`${role.id}-${groupPermId}`}
            className="bg-[#F8F8F8] flex items-center px-10 py-2"
          >
            <Checkbox
              checked={isSuper ? true : checked}
              disabled={isSuper}
              onCheckedChange={(v) =>
                onToggle(role.id, groupPermId, Boolean(v))
              }
              aria-label={`Toggle ${group.label} group for ${role.name}`}
            />
          </div>
        )
      })}
    </div>
  )
}

export default function PermissionsList() {
  // Saved state (authoritative)
  const [savedRoles, setSavedRoles] = useState<Role[]>(() =>
    deepClone(defaultRoles)
  )
  // Working state (editable)
  const [roles, setRoles] = useState<Role[]>(() => deepClone(defaultRoles))

  // New role input
  const [addingRole, setAddingRole] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const newRoleInputRef = useRef<HTMLInputElement>(null)

  const dirty = useMemo(() => !isEqual(roles, savedRoles), [roles, savedRoles])

  const addNewRole = () => {
    const trimmed = newRoleName.trim()
    if (!trimmed) return

    // Build an empty permission map based on our known ids (literal, no helpers)
    const emptyPerms: Record<string, boolean> = {
      asset: false,
      location: false,
      analytics: false,
      users: false,
      audit: false,
      settings: false,
      'asset.upload': false,
      'asset.view': false,
      'asset.edit': false,
      'asset.download': false,
      'location.view': false,
      'location.edit': false,
      'analytics.create': false,
      'analytics.view': false,
      'analytics.edit': false,
      'analytics.download': false,
      'users.view': false,
      'users.edit': false,
      'users.add': false,
      'audit.view': false,
      'settings.edit': false,
      'settings.delete': false,
    }

    const newRole: Role = {
      id: trimmed.toLowerCase().replace(/\s+/g, '-'),
      name: trimmed,
      permissions: emptyPerms,
    }
    const updated = [...roles, newRole]
    setRoles(updated)
    console.log('New role created:', newRole)
    setNewRoleName('')
    setAddingRole(false)
  }

  const togglePermission = (
    roleId: string,
    permId: string,
    checked: boolean
  ) => {
    if (roleId === 'super-admin') return // super admin immutable
    setRoles((prev) => {
      const next = prev.map((r) =>
        r.id === roleId
          ? { ...r, permissions: { ...r.permissions, [permId]: !!checked } }
          : r
      )
      return next
    })
  }

  const saveChanges = () => {
    setSavedRoles(deepClone(roles))
  }

  const cancelChanges = () => {
    setRoles(deepClone(savedRoles))
    setAddingRole(false)
    setNewRoleName('')
  }

  // Focus new role input when it appears
  if (addingRole) {
    setTimeout(() => newRoleInputRef.current?.focus(), 0)
  }

  // Layout constants
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
            <Button variant="ghost" onClick={cancelChanges} className='h-12 border border-gray-400 cursor-pointer'>
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
              <div className="flex items-center justify-between">
                <span className="truncate">{role.name}</span>
                {idx === roles.length - 1 && !addingRole && (
                  <Button
                    aria-label="Add role"
                    className=" h-5 w-5 bg-white text-primary border border-gray-400 rounded-full cursor-pointer hover:bg-secondary"
                    onClick={() => setAddingRole(true)}
                    title="Add role"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </HeaderCell>
          ))}

          {/* New role inline input */}
          {addingRole && (
            <>
              <div className="col-span-full col-start-2">
                <div className="flex items-center gap-2 px-4 py-2">
                  <Input
                    ref={newRoleInputRef}
                    placeholder="New role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="max-w-xl h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addNewRole()
                      if (e.key === 'Escape') {
                        setAddingRole(false)
                        setNewRoleName('')
                      }
                    }}
                  />
                  <Button
                    
                    onClick={addNewRole}
                    disabled={!newRoleName.trim()}
                  >
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
            </>
          )}

          {/* Body rows */}
          {permissionGroups.map((group) => (
            <div key={group.id} className="contents">
              <GroupHeaderRow
                group={group}
                roles={roles}
                onToggle={togglePermission}
              />

              {group.items.map((item, rowIdx) => (
                <div
                  key={item.id}
                  className={cn(
                    'contents',
                    rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                  )}
                >
                  <div
                    className={cn(
                      ' px-4 py-3 text-sm',
                      firstColWidth
                    )}
                  >
                    {item.label}
                  </div>
                  {roles.map((role) => {
                    const isSuper = role.id === 'super-admin'
                    const groupPermId = group.headerPermissionId ?? group.id
                    const groupEnabled = !!role.permissions[groupPermId]
                    return (
                      <div
                        key={`${role.id}-${item.id}`}
                        className={cn(
                          ' px-10 py-3',
                          roleColWidth,
                          'flex items-center'
                        )}
                      >
                        <Checkbox
                          checked={isSuper ? true : !!role.permissions[item.id]}
                          disabled={isSuper || !groupEnabled}
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
    </div>
  )
}
