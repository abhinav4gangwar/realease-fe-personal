import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

export interface AnalyticsSidebarProps {
  isOpen: boolean
  onClose: () => void
  analytics: any
}
const AnalyticsSidebar = ({
  isOpen,
  onClose,
  analytics,
}: AnalyticsSidebarProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [currentAnalytic, setCurrentAnalytic] = useState()

  const handleDeleteClick = () => {
    console.log(`Delete ${currentAnalytic?.id}`)
    setIsDeleteOpen(false)
  }

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
              {analytics.cards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-md bg-white p-4 shadow-md"
                >
                  <div className="flex justify-between">
                    <h1>{card.title}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE]"
                      onClick={() => {
                        setCurrentAnalytic(card)
                        setIsDeleteOpen(true)
                      }}
                    >
                      <X className="h-4 w-4 font-bold" />
                    </Button>
                  </div>
                </div>
              ))}
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

      {isDeleteOpen && currentAnalytic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-gray-500 bg-white shadow-lg">
            <div className="p-6">
              <h2 className="mb-2 text-xl font-semibold">Delete Analytic</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to Delete this Analytic?
              </p>

              <div className="flex gap-3">
                <Button
                  className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
                  onClick={handleDeleteClick}
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
                  onClick={() => {
                    setCurrentAnalytic(undefined)
                    setIsDeleteOpen(false)
                  }}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AnalyticsSidebar
