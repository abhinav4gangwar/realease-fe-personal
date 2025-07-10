import documentsData from "@/lib/documents.dummy.json"
import { DocumentViewer } from "./_components/document-viewer"


const Documentspage = () => {
  return (
    <div>
      <DocumentViewer recentlyAccessed={documentsData.recentlyAccessed} allFiles={documentsData.allFiles} />
    </div>
  )
}

export default Documentspage
