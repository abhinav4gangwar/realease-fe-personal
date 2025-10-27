export const permissionStringToKey = (perm: string): string => {
  const map: Record<string, string> = {
    DOC_ACCESS_UPLOAD: 'asset.upload',
    DOC_ACCESS_VIEW: 'asset.view',
    DOC_ACCESS_EDIT: 'asset.edit',
    DOC_ACCESS_DOWNLOAD: 'asset.download',

    MAP_ACCESS_VIEW: 'location.view',
    MAP_ACCESS_EDIT: 'location.edit',

    ANALYTICS_ACCESS_CREATE: 'analytics.create',
    ANALYTICS_ACCESS_VIEW: 'analytics.view',
    ANALYTICS_ACCESS_EDIT: 'analytics.edit',
    ANALYTICS_ACCESS_DOWNLOAD: 'analytics.download',

    USER_MGMT_VIEW: 'users.view',
    USER_MGMT_EDIT: 'users.edit',
    USER_MGMT_ADD_REMOVE: 'users.add',

    AUDIT_ACCESS_VIEW: 'audit.view',

    SETTINGS_ACCESS_EDIT: 'settings.edit',
    SETTINGS_ACCESS_DELETE_ACCOUNT: 'settings.delete',
  }

  return map[perm] || perm.toLowerCase()
}