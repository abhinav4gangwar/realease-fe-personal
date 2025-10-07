import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EllipsisVertical, UserPlus } from 'lucide-react'
import { useState } from 'react'
import AccessControlStateToggle from './access-control-state-toggle'

// Dummy user data
const usersData = [
  { id: 1, name: 'Alice Johnson', email: 'alice.johnson@email.com', role: 'Super Admin' },
  { id: 2, name: 'Bob Smith', email: 'bob.smith@email.com', role: 'Admin' },
  { id: 3, name: 'Carol Williams', email: 'carol.williams@email.com', role: 'Manager' },
  { id: 4, name: 'David Brown', email: 'david.brown@email.com', role: 'Team Member' },
  { id: 5, name: 'Emma Davis', email: 'emma.davis@email.com', role: 'Intern' },
  { id: 6, name: 'Frank Miller', email: 'frank.miller@email.com', role: 'Admin' },
  { id: 7, name: 'Grace Wilson', email: 'grace.wilson@email.com', role: 'Manager' },
  { id: 8, name: 'Henry Moore', email: 'henry.moore@email.com', role: 'Team Member' },
  { id: 9, name: 'Ivy Taylor', email: 'ivy.taylor@email.com', role: 'Team Member' },
  { id: 10, name: 'Jack Anderson', email: 'jack.anderson@email.com', role: 'Intern' },
  { id: 11, name: 'Karen Thomas', email: 'karen.thomas@email.com', role: 'Manager' },
  { id: 12, name: 'Leo Jackson', email: 'leo.jackson@email.com', role: 'Admin' }
]



const UsersList = () => {
  const [selectedRole, setSelectedRole] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const roles = ['All', 'Super Admin', 'Admin', 'Manager', 'Team Member', 'Intern']

  // Filter users based on selected role and search query
  const filteredUsers = usersData.filter(user => {
    const matchesRole = selectedRole === 'All' || user.role === selectedRole
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    
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

          <Button className="text-primary hover:bg-primary h-12 w-12 cursor-pointer rounded-full border border-gray-400 bg-white font-bold hover:text-white">
            <UserPlus className="size-6" />
          </Button>
        </div>
      </div>

      <div className="flex rounded-md border border-gray-300 bg-white">
        <div className="flex-1/5 border-r border-r-gray-300">
          <div className="flex border-b border-gray-300 px-5 py-13 text-xl font-semibold text-[#4E4F54]">
            User Roles
          </div>
          <div className="flex flex-col gap-10 p-5">
            {roles.map(role => (
              <p
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`cursor-pointer transition-colors ${
                  selectedRole === role 
                    ? 'font-semibold text-blue-600' 
                    : 'hover:text-gray-700'
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
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
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
                    {user.role}
                  </div>
                  <div className="col-span-2 flex pl-5 text-gray-400">
                    <EllipsisVertical className="cursor-pointer hover:text-gray-600" />
                  </div>
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
    </div>
  )
}

export default UsersList