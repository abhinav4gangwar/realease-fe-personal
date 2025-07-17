'use client'
import documentsData from '@/lib/documents.dummy.json'
import { apiClient } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DocumentViewer } from './_components/document-viewer'

const Documentspage = () => {
  const router = useRouter();
  const [fetchedDocuments, setFetchedDocuments] = useState(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await apiClient.get('/dashboard/documents/list')
        setFetchedDocuments(response.data)
        console.log('Fetched documents:', response.data)
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    fetchDocuments()
  }, [])

  return (
    <div>
      <DocumentViewer
        // recentlyAccessed={documentsData.recentlyAccessed}
        allFiles={documentsData.allFiles}
      />
    </div>
  )
}

export default Documentspage
