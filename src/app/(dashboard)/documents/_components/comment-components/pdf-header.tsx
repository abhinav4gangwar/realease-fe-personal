'use client'

import { PlanAccessWrapper } from '@/components/permission-control/plan-access-wrapper'
import { Button } from '@/components/ui/button'
import {
  Download,
  FolderInput,
  List,
  Loader2,
  MessageSquare,
  Pencil,
  X
} from 'lucide-react'
import type { FC } from 'react'
import { HiShare } from 'react-icons/hi2'
import { FileIcon } from '../file-icon'

interface PDFHeaderProps {
  document: any
  isLoadingComments: boolean
  hasTextSelection: boolean
  onClose: () => void
  onShareClick?: (document: any) => void
  onDownloadClick?: (document: any) => void
  onMoveClick?: (document: any) => void
  onEditClick?: () => void
  onCommentClick: () => void
  onSideClick: () => void
}

export const PDFHeader: FC<PDFHeaderProps> = ({
  document,
  isLoadingComments,
  hasTextSelection,
  onClose,
  onShareClick,
  onDownloadClick,
  onMoveClick,
  onEditClick,
  onCommentClick,
  onSideClick
}) => {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex h-12 items-center gap-3">
        <FileIcon type={document?.icon || ''} />
        <h2 className="text-lg font-semibold text-white">
          {document?.name || 'PDF Preview'}
        </h2>
        {isLoadingComments && (
          <div className="flex items-center gap-2 text-sm text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading comments...
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <PlanAccessWrapper featureId='docs_commentsAnnotations'>
        <Button
          variant="ghost"
          size="icon"
          className={`hidden h-6 w-6 cursor-pointer items-center justify-center text-white transition-all lg:flex ${
            hasTextSelection
              ? 'hover:text-primary bg-blue-500/20 ring-2 ring-blue-400'
              : 'cursor-not-allowed opacity-50'
          }`}
          onClick={(e) => {
            e.stopPropagation()
            if (hasTextSelection) {
              onCommentClick()
            }
          }}
          disabled={!hasTextSelection}
          title={
            hasTextSelection
              ? 'Add comment to selection'
              : 'Select text to comment'
          }
        >
          <MessageSquare className="h-3 w-3" />
        </Button>
        </PlanAccessWrapper>

        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hidden h-6 w-6 cursor-pointer items-center justify-center text-white lg:flex"
          onClick={(e) => {
            e.stopPropagation()
            if (onEditClick) {
              onEditClick()
            }
          }}
          title="Edit document details"
        >
          <Pencil className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hidden h-6 w-6 cursor-pointer items-center justify-center text-white lg:flex"
          onClick={(e) => {
            e.stopPropagation()
            if (onShareClick) {
              onShareClick(document)
            }
          }}
        >
          <HiShare className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary h-6 w-6 cursor-pointer text-white"
          onClick={(e) => {
            e.stopPropagation()
            if (onDownloadClick) {
              onDownloadClick(document)
            }
          }}
        >
          <Download className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hidden h-6 w-6 cursor-pointer items-center justify-center text-white lg:flex"
          onClick={(e) => {
            e.stopPropagation()
            if (onMoveClick) {
              onMoveClick(document)
            }
          }}
        >
          <FolderInput className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hidden h-6 w-6 cursor-pointer items-center justify-center text-white lg:flex"
          onClick={(e) => {
            e.stopPropagation()
            if (onSideClick) {
              onSideClick()
            }
          }}
        >
          <List className="h-3 w-3" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:text-primary h-6 w-6 cursor-pointer text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
