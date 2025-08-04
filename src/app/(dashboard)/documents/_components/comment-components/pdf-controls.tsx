"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react"
import type { FC } from "react"

interface PDFControlsProps {
  currentPage: number
  numPages: number | null
  pdfScale: number
  onPrevPage: () => void
  onNextPage: () => void
  onZoomIn: () => void
  onZoomOut: () => void
}

export const PDFControls: FC<PDFControlsProps> = ({
  currentPage,
  numPages,
  pdfScale,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-4">
      {/* Page Navigation */}
      <div className="flex items-center gap-1 rounded-lg bg-[#9B9B9D]  shadow-lg p-1 text-white">
        <Button variant="ghost" size="sm" onClick={onPrevPage} disabled={currentPage <= 1} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium px-2 min-w-[80px] text-center">
          Page {currentPage} / {numPages || "--"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNextPage}
          disabled={!numPages || currentPage >= numPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 rounded-lg  bg-[#9B9B9D]  shadow-lg p-1 text-white">
        <Button variant="ghost" size="sm" onClick={onZoomOut} disabled={pdfScale <= 0.5} className="h-8 w-8 p-0">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium px-2 min-w-[50px] text-center">{Math.round(pdfScale * 100)}%</span>
        <Button variant="ghost" size="sm" onClick={onZoomIn} disabled={pdfScale >= 3.0} className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
