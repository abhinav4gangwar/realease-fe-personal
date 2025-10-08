'use client'

import { useGlobalContextProvider } from '@/providers/global-context'
import PermissionsList from '../_components/access-control-components/permissions-list'
import UsersList from '../_components/access-control-components/users-list'

const AccessControlPage = () => {
  const { accessControlState } = useGlobalContextProvider()

  if (accessControlState === 'users') {
    return <UsersList />
  } else if (accessControlState === 'permissions') {
    return <PermissionsList />
  }
}

export default AccessControlPage
