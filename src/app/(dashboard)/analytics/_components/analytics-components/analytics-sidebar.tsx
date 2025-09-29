import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'

export interface AnalyticsSidebarProps {
  isOpen: boolean
  onClose: () => void
}
const AnalyticsSidebar = ({ isOpen, onClose }: AnalyticsSidebarProps) => {
  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[600px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <h2 className="truncate pl-1 text-xl font-semibold">
                    Customise Analytics
                  </h2>
                </div>
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">

              <div className="rounded-md bg-white p-4 shadow-md">
                <div className="flex justify-between">
                  <h1>Asset Location Distribution</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-primary"
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>


              </div>

               <div className="rounded-md bg-white p-4 shadow-md">
                <div className="flex justify-between">
                  <h1>Asset Location Distribution</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-primary"
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>


              </div>

               <div className="rounded-md bg-white p-4 shadow-md">
                <div className="flex justify-between">
                  <h1>Asset Location Distribution</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-primary"
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>


              </div>

               <div className="rounded-md bg-white p-4 shadow-md">
                <div className="flex justify-between">
                  <h1>Asset Location Distribution</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-primary"
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>


              </div>

               <div className="rounded-md bg-white p-4 shadow-md">
                <div className="flex justify-between">
                  <h1>Asset Location Distribution</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-primary"
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>


              </div>

               <div className="rounded-md bg-white p-4 shadow-md">
                <div className="flex justify-between">
                  <h1>Asset Location Distribution</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-primary"
                  >
                    <X className="h-4 w-4 font-bold" />
                  </Button>
                </div>


              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-4">
                  <Button className="hover:bg-secondary text-secondary h-11 w-[200px] cursor-pointer border border-gray-400 bg-white px-6 font-semibold hover:text-white">
                    Standalone Stat <Plus />
                  </Button>

                  <Button className="hover:bg-secondary text-secondary h-11 w-[200px] cursor-pointer border border-gray-400 bg-white px-6 font-semibold hover:text-white">
                    Comparative Stat <Plus />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AnalyticsSidebar
