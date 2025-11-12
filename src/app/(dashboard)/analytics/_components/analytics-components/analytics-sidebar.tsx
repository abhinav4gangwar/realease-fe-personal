import { Button } from '@/components/ui/button'
import { apiClient } from '@/utils/api'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import ComparativeStatForm from './comparative-stat-form'
import StandAloneForm from './stand-alone-form'

export interface AnalyticsSidebarProps {
  isOpen: boolean
  onClose: () => void
  analytics: any
  onAnalyticsCreated: () => void
  onAnalyticsDeleted: () => void
}

const AnalyticsSidebar = ({
  isOpen,
  onClose,
  analytics,
  onAnalyticsCreated,
  onAnalyticsDeleted,
}: AnalyticsSidebarProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [currentAnalytic, setCurrentAnalytic] = useState<any>()
  const [isStandAloneOpen, setIsStandAloneOpen] = useState(false)
  const [isComparativeOpen, setIsComparativeOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = async () => {
    if (!currentAnalytic?.id) return

    setIsDeleting(true)
    try {
      await apiClient.delete(`/analytics/${currentAnalytic.id}`)
      console.log(`Deleted analytics card ${currentAnalytic.id}`)
      toast.error('Deleted Analytics>')
      setIsDeleteOpen(false)
      setCurrentAnalytic(undefined)
      onAnalyticsDeleted()
    } catch (error: any) {
      console.error('Failed to delete analytics card:', error)
      toast.message('Failed to Delete Analytics.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStandAloneSuccess = () => {
    setIsStandAloneOpen(false)
    onAnalyticsCreated()
  }

  const handleComparativeSuccess = () => {
    setIsComparativeOpen(false)
    onAnalyticsCreated()
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
              {analytics?.cards?.map((card: any) => (
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
                  <Button
                    className="hover:bg-secondary text-secondary h-11 w-[200px] cursor-pointer border border-gray-400 bg-white px-6 font-semibold hover:text-white"
                    onClick={() => setIsStandAloneOpen(true)}
                  >
                    Standalone Stat <Plus className="text-primary ml-2" />
                  </Button>

                  <Button
                    className="hover:bg-secondary text-secondary h-11 w-[200px] cursor-pointer border border-gray-400 bg-white px-6 font-semibold hover:text-white"
                    onClick={() => setIsComparativeOpen(true)}
                  >
                    Comparative Stat <Plus className="text-primary ml-2" />
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
                Are you sure you want to delete {currentAnalytic.title} ?
              </p>

              <div className="flex gap-3">
                <Button
                  className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes'}
                </Button>
                <Button
                  variant="outline"
                  className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
                  onClick={() => {
                    setCurrentAnalytic(undefined)
                    setIsDeleteOpen(false)
                  }}
                  disabled={isDeleting}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <StandAloneForm
        isOpen={isStandAloneOpen}
        onClose={() => setIsStandAloneOpen(false)}
        onSuccess={handleStandAloneSuccess}
      />

      <ComparativeStatForm
        isOpen={isComparativeOpen}
        onClose={() => setIsComparativeOpen(false)}
        onSuccess={handleComparativeSuccess}
      />
    </>
  )
}

export default AnalyticsSidebar
