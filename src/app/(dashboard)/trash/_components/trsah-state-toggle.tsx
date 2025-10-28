import { Button } from "@/components/ui/button"
import { useGlobalContextProvider } from "@/providers/global-context"

const TrashStateToggleButton = () => {
    const { trashState, setTrashState } = useGlobalContextProvider()
  return (
    <div className="flex items-center rounded-full border border-gray-400">
      <Button
        onClick={() => setTrashState('docs')}
        className={`h-12 px-6 ${trashState === 'docs' ? 'bg-secondary rounded-full text-white' : 'text-secondary bg-transparent hover:bg-transparent'} cursor-pointer rounded-l-full`}
      >
        Documents
      </Button>

      <Button
        onClick={() => setTrashState('props')}
        className={`h-12 px-6 ${trashState === 'props' ? 'bg-secondary rounded-full text-white' : 'text-secondary bg-transparent hover:bg-transparent'} cursor-pointer rounded-r-full`}
      >
        Properties
      </Button>
    </div>
  )
}

export default TrashStateToggleButton
