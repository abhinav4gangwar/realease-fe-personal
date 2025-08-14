import Image from 'next/image'

interface FileIconProps {
  type: string
  className?: string
}

export function FileIcon({ type, className = 'w-5 h-6' }: FileIconProps) {
  const getIconPath = () => {
    const ext = type?.toLowerCase().trim()

    switch (ext) {
      // Documents
      case 'pdf':
        return '/assets/doc-icons/pdf.svg'
      case 'word':
      case 'doc':
      case 'docx':
      case 'rtf':
      case 'txt':
        return '/assets/doc-icons/doc.svg'

      // Spreadsheets
      case 'excel':
      case 'xls':
      case 'xlsx':
      case 'csv':
        return '/assets/doc-icons/xls.svg'

      // Presentations
      case 'powerpoint':
      case 'ppt':
      case 'pptx':
      case 'key':
      case 'keynote':
        return '/assets/doc-icons/ppt.svg'

      // Images
      case 'img':
      case 'svg':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '/assets/doc-icons/img.svg'

      // Archives
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
        return '/assets/doc-icons/zip.svg'

      // Code files
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
      case 'xml':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'sh':
        return '/assets/doc-icons/code.svg'

      // Others
      case 'folder':
        return '/assets/doc-icons/folder.svg'
      case 'kml':
        return '/assets/doc-icons/kml.svg'

      // Default generic file
      default:
        return '/assets/doc-icons/pdf.svg'
    }
  }

  return (
    <Image
      src={getIconPath()}
      alt={`${type} file icon`}
      width={20}
      height={20}
      className={className}
    />
  )
}
