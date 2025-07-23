export interface FileItem {
  name: string
  path: string
  size: number
  type: string
  isDirectory: boolean
  children?: FileItem[]
  file?: File
  propertyId?: string
  tags?: string
}

const readAllDirectoryEntries = async (directoryReader: any): Promise<any[]> => {
  const entries = []
  let readEntries = await new Promise<any[]>((resolve) => {
    directoryReader.readEntries(resolve, resolve)
  })
  while (readEntries.length > 0) {
    entries.push(...readEntries)
    readEntries = await new Promise<any[]>((resolve) => {
      directoryReader.readEntries(resolve, resolve)
    })
  }
  return entries
}

export const processEntry = async (entry: any, path = ""): Promise<FileItem | null> => {
  const fullPath = path ? `${path}/${entry.name}` : entry.name

  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => entry.file(resolve, reject))
    return {
      name: file.name,
      path: fullPath,
      size: file.size,
      type: file.type,
      isDirectory: false,
      file,
      propertyId: "0",
      tags: "",
    }
  }

  if (entry.isDirectory) {
    const reader = entry.createReader()
    const childrenEntries = await readAllDirectoryEntries(reader)
    const children = await Promise.all(
      childrenEntries.map((childEntry) => processEntry(childEntry, fullPath))
    )
    const validChildren = children.filter((c): c is FileItem => c !== null)

    validChildren.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    return {
      name: entry.name,
      path: fullPath,
      size: 0,
      type: "directory",
      isDirectory: true,
      children: validChildren,
    }
  }

  return null
}

export const buildFileTreeFromInput = (files: File[]): FileItem[] => {
    const tree: { [key: string]: any } = {}
    files.forEach((file) => {
      const path = (file as any).webkitRelativePath || file.name
      const parts = path.split("/").filter(Boolean)
      let currentLevel = tree
      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1
        if (!isLast) {
          currentLevel[part] = currentLevel[part] || { children: {} }
          currentLevel = currentLevel[part].children
        } else {
          currentLevel[part] = { file }
        }
      })
    })

    const convertToStructure = (obj: any, path = ""): FileItem[] => {
      return Object.entries(obj).map(([name, value]: [string, any]) => {
        const currentPath = path ? `${path}/${name}` : name
        if (value.children) {
          return {
            name, path: currentPath, isDirectory: true, size: 0, type: "directory",
            children: convertToStructure(value.children, currentPath),
          }
        } else {
          const file = value.file as File
          return {
            name: file.name, path: currentPath, size: file.size, type: file.type,
            isDirectory: false, file, propertyId: "0", tags: "",
          }
        }
      })
    }
    return convertToStructure(tree)
}