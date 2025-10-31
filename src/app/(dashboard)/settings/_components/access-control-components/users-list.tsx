import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { apiClient } from '@/utils/api'
import { EllipsisVertical, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import AccessControlStateToggle from './access-control-state-toggle'
import ChangeSuperAdminModel from './change-superadmin-model'
import CreateUserModal from './create-user-model'
import DeleteUserModal from './delete-user-model'
import EditUserModal from './update-user-model'

const UsersList = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState(['All'])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState()
  const [selectedRole, setSelectedRole] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isChangeSuperAdminModelOpen, setIsChangeSUperAdminModelOpen] =
    useState(false)
  const [isCreateUserModelOpen, setIsCreateUserModelOpen] = useState(false)
  const [isUpdateUserModelOpen, setIsUpdateUserModelOpen] = useState(false)
  const [isDeleteUserModelOpen, setIsDeleteUserModelOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/users')
      if (response.data.success && response.data.data) {
        setUsers(response.data.data)
        
        // Extract unique roles from users data
        const uniqueRoles = [...new Set(response.data.data.map(user => user.role.name))]
        setRoles(['All', ...uniqueRoles])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    const userRole = user.role.name
    const matchesRole = selectedRole === 'All' || userRole === selectedRole
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userRole.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesRole && matchesSearch
  })

  return (
    <div>
      <div className="flex justify-between pb-4">
        <div className="flex items-center gap-4">
          <div className="text-secondary text-2xl font-semibold lg:text-3xl">
            Roles
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AccessControlStateToggle />

          <Button
            className="text-primary hover:bg-primary h-12 w-12 cursor-pointer rounded-full border border-gray-400 bg-white font-bold hover:text-white"
            onClick={() => setIsCreateUserModelOpen(true)}
          >
            <UserPlus className="size-6" />
          </Button>
        </div>
      </div>

      <div className="flex rounded-md border border-gray-300 bg-white">
        <div className="flex-1/5 border-r border-r-gray-300">
          <div className="flex border-b border-gray-300 px-5 py-13 text-xl font-semibold text-[#4E4F54]">
            User Roles
          </div>
          <div className="flex flex-col gap-6 p-5">
            {roles.map((role) => (
              <p
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`cursor-pointer transition-colors ${
                  selectedRole === role
                    ? 'rounded-lg bg-[#F2F2F2] p-2 font-semibold'
                    : 'hover:text-primary'
                }`}
              >
                {role}
              </p>
            ))}
          </div>
        </div>

        <div className="flex-4/5">
          <div className="flex items-center justify-between border-b border-gray-300 p-4">
            <h1 className="text-lg text-[#4E4F54]">List of Users</h1>
            <Input
              className="ml-1 h-10 w-sm rounded-full"
              placeholder="Search Users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-md text-secondary grid grid-cols-16 gap-4 border-b border-gray-300 bg-[#F2F2F2] p-4 font-semibold">
            <div className="col-span-5 text-left">Name</div>
            <div className="col-span-5 text-left">Email</div>
            <div className="col-span-4 text-left">Role</div>
            <div className="col-span-2 text-left">Actions</div>
          </div>

          <div className="h-screen">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading users...
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="text-md text-secondary grid grid-cols-16 gap-4 p-4 hover:bg-gray-50"
                >
                  <div className="col-span-5 text-left font-semibold">
                    {user.name}
                  </div>
                  <div className="col-span-5 truncate text-left">
                    {user.email}
                  </div>
                  <div className="col-span-4 text-left font-semibold">
                    {user.role.name}
                  </div>
                  {user.isSuperAdmin ? (
                    <div className="col-span-2 flex pl-5 text-gray-400">
                      <EllipsisVertical
                        className="hover:text-primary cursor-pointer"
                        onClick={() => {
                          setIsChangeSUperAdminModelOpen(true)
                          setSelectedUser(user)
                        }}
                      />
                    </div>
                  ) : (
                    <div className="col-span-2 flex gap-2 text-gray-400">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary h-6 w-6 cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsUpdateUserModelOpen(true)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary h-6 w-6 cursor-pointer"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteUserModelOpen(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangeSuperAdminModel
        isOpen={isChangeSuperAdminModelOpen}
        onClose={() => {
          setIsChangeSUperAdminModelOpen(false)
          setSelectedUser(undefined)
        }}
        user={selectedUser}
      />

      <CreateUserModal
        isOpen={isCreateUserModelOpen}
        onClose={() => setIsCreateUserModelOpen(false)}
        onUserCreated={fetchUsers}
      />

      <EditUserModal
        isOpen={isUpdateUserModelOpen}
        onClose={() => {
          setIsUpdateUserModelOpen(false)
          setSelectedUser(undefined)
        }}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />

      <DeleteUserModal
        user={selectedUser}
        isOpen={isDeleteUserModelOpen}
        onClose={() => {
          setIsDeleteUserModelOpen(false)
          setSelectedUser(undefined)
        }}
        onUserDeleted={fetchUsers}
      />
    </div>
  )
}

export default UsersList