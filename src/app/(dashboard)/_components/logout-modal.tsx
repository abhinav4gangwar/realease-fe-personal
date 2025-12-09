import { Button } from '@/components/ui/button'
import { useEscapeKey } from '@/hooks/useEscHook'
import Image from 'next/image'


const LogoutModel = ({
  isOpen,
  onClose,
  logout
}: {
  isOpen: boolean
  onClose: () => void
  logout : any
}) => {
  useEscapeKey(() => onClose(), isOpen)

  if (!isOpen) return
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full lg:max-w-md rounded-lg border border-gray-500 bg-white shadow-lg">
        {/* Content */}
        <div className="p-6 text-secondary">
          <div className="flex justify-between">
            <Image
              src="/assets/logout-image.svg"
              height={80}
              width={80}
              alt="delete imgae"
            />
            <h2 className="m-5 text-left text-xl font-semibold">
              Are you sure you want to log out?
            </h2>
          </div>

          <p className="mt-3 mb-6 text-left text-gray-600">
            Access your account anytime by entering your credentials.
          </p>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={logout}
              className="hover:bg-secondary h-11 lg:w-[190px] w-32 cursor-pointer bg-transparent px-6 hover:text-white"
            >
              Yes
            </Button>
            <Button
              className="bg-primary hover:bg-secondary h-11 lg:w-[190px] w-32 cursor-pointer px-6"
              onClick={onClose}
            >
              No
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoutModel