import Image from "next/image"

interface FileIconProps {
  type: string
  className?: string
}

export function FileIcon({ type, className = "w-5 h-6" }: FileIconProps) {
  const getIconPath = () => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "/assets/doc-icons/pdf.svg"
      case "word":
      case "docx":
      case "doc":
        return "/assets/doc-icons/doc.svg"
      case "excel":
      case "xlsx":
      case "xls":
        return "/assets/doc-icons/xls.svg"
      case "powerpoint":
      case "pptx":
      case "ppt":
        return "/assets/doc-icons/ppt.svg"
      case "folder":
        return "/assets/doc-icons/folder.svg"
      case "img":
        return "/assets/doc-icons/img.svg"
      default:
        return "/assets/doc-icons/kml.svg"
    }
  }

  return (
    <Image
      src={getIconPath() || "/zip.svg"}
      alt={`${type} file icon`}
      width={20}
      height={20}
      className={className}
    />
  )
}
