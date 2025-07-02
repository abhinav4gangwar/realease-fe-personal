import Image from "next/image"

interface FileIconProps {
  type: string
  className?: string
}

export function FileIcon({ type, className = "w-5 h-7" }: FileIconProps) {
  const getIconPath = () => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "/assets/doc-icons/pdf.png"
      case "word":
      case "docx":
      case "doc":
        return "/assets/doc-icons/doc.png"
      case "excel":
      case "xlsx":
      case "xls":
        return "/assets/doc-icons/xls.png"
      case "powerpoint":
      case "pptx":
      case "ppt":
        return "/assets/doc-icons/ppt.png"
      case "folder":
        return "/assets/doc-icons/folder.png"
      case "img":
        return "/assets/doc-icons/img.png"
      default:
        return "/assets/doc-icons/kml.png"
    }
  }

  return (
    <Image
      src={getIconPath() || "/zip.png"}
      alt={`${type} file icon`}
      width={20}
      height={20}
      className={className}
    />
  )
}
