import { Properties } from '@/types/property.types'
import { apiClient } from '@/utils/api'
import { toast } from 'sonner'

export const handleDownloadClick = async (property: Properties) => {
  try {
    console.log('Downloading', property)

    const response = await apiClient.get(
      `/dashboard/properties/download/?propertyId=${property.id}`,
      {
        responseType: 'blob',
      }
    )

    if (response && response.data) {
      const contentType =
        response.headers['content-type'] || 'application/octet-stream'

      const blob = new Blob([response.data], { type: contentType })
      const url = window.URL.createObjectURL(blob)

      let filename = `property-${property.id}-files.zip`
      const contentDisposition = response.headers['content-disposition']

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        )
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '')
        }
      }

      const link = window.document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      window.document.body.appendChild(link)
      link.click()

      // Cleanup
      window.document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Download started successfully!')
    } else {
      toast.error('No file data received')
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.error || error?.message || 'Download failed'
    toast.error(errorMessage)
    console.error('Download failed:', error)
  }
}


export  const formatCurrency = (value: string | number | undefined) => {
    if (!value) return '0'
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return numValue.toLocaleString('en-IN')
  }