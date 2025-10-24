'use client'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import { Button } from '@/components/ui/button'
import type { FileItem } from '@/lib/fileUploadUtils'
import { ArrowLeft, X } from 'lucide-react'
import { FileIcon } from './file-icon'
import { PropertyInput } from './properties-input'
import { TagInput } from './tags-input'

interface FileDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  currentViewItems: FileItem[]
  folderPath: string[]
  handleBackClick: () => void
  handleFolderClick: (folder: FileItem) => void
  updateFileMetadata: (
    path: string,
    field: 'propertyId' | 'tags',
    value: string
  ) => void
  handleSave: () => void
  isLoading: boolean
}

const getFileType = (fileName: string, isDirectory: boolean) => {
  if (isDirectory) return 'folder'
  return fileName.split('.').pop()?.toLowerCase() ?? 'file'
}

export function FileDetailsDialog({
  isOpen,
  onOpenChange,
  currentViewItems,
  folderPath,
  handleBackClick,
  handleFolderClick,
  updateFileMetadata,
  handleSave,
  isLoading,
}: FileDetailsDialogProps) {
  if (!isOpen) return null

  const handleClose = () => onOpenChange(false)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background mx-4 flex max-h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-gray-400 shadow-lg">
          <div className="flex items-center justify-between p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              {folderPath.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleBackClick}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              Edit Details{' '}
              {folderPath.length > 0 && (
                <span className="text-muted-foreground text-sm">
                  / {folderPath.join(' / ')}
                </span>
              )}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:text-primary h-8 w-8 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 space-y-2 p-4">
            <div className="max-h-[400px] overflow-auto rounded-md border border-gray-500 p-4">
              <div className="bg-background sticky -top-4 grid grid-cols-3 gap-4 px-2 py-5 font-medium">
                <div>Name</div>
                <div>Linked Property</div>
                <div>Tag</div>
              </div>
              <div className="mt-1 space-y-1">
                {currentViewItems.map((item) => {
                  return (
                    <div
                      key={item.path}
                      className="grid grid-cols-3 items-center gap-4 p-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileIcon
                          type={getFileType(item.name, item.isDirectory)}
                        />
                        {item.isDirectory ? (
                          <button
                            className="hover:text-primary truncate text-left"
                            onClick={() => handleFolderClick(item)}
                          >
                            {item.name}
                          </button>
                        ) : (
                          <span className="truncate">{item.name}</span>
                        )}
                      </div>
                      {!item.isDirectory ? (
                        <>
                          <PropertyInput
                            value={item.propertyId || ''}
                            onChange={(value) =>
                              updateFileMetadata(item.path, 'propertyId', value)
                            }
                            placeholder="Select property..."
                          />
                          <PlanAccessWrapper featureId="DOCUMENT_TAGGING_FILTERING">
                            <TagInput
                              value={item.tags || ''}
                              onChange={(value) =>
                                updateFileMetadata(item.path, 'tags', value)
                              }
                              placeholder="Select tags..."
                            />
                          </PlanAccessWrapper>
                        </>
                      ) : (
                        <>
                          <div />
                          <div />
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4">
            <div></div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="hover:bg-secondary h-11 w-28 cursor-pointer bg-transparent px-6 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-primary hover:bg-secondary h-11 w-28 cursor-pointer px-6"
              >
                {isLoading ? 'Uploading...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
