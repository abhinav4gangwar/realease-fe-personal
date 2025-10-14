import { Button } from '@/components/ui/button'
import { useGlobalContextProvider } from '@/providers/global-context'

const AccessControlStateToggle = () => {
  const { accessControlState, setAccessControlState } =
    useGlobalContextProvider()
  return (
    <div className="flex items-center rounded-full border border-gray-400">
      <Button
        onClick={() => setAccessControlState('users')}
        className={`h-12 px-6 ${accessControlState === 'users' ? 'bg-secondary rounded-full text-white' : 'text-secondary bg-transparent hover:bg-transparent'} cursor-pointer rounded-l-full`}
      >
        Users
      </Button>

      <Button
        onClick={() => setAccessControlState('permissions')}
        className={`h-12 px-6 ${accessControlState === 'permissions' ? 'bg-secondary rounded-full text-white' : 'text-secondary bg-transparent hover:bg-transparent'} cursor-pointer rounded-r-full`}
      >
        Permissions
      </Button>
    </div>
  )
}

export default AccessControlStateToggle
