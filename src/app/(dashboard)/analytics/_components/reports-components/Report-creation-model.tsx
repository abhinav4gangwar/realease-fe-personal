'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  AnalyticsCard,
  ChartType,
  PositionedBlock,
  ReportBlock,
  ReportJSON,
} from '@/types/report-types'
import { ArrowLeft, FileDown, SparkleIcon, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import ReportCanvas from './report-canvas'
import ReportPreviewModal from './report-preview-model'
import ReportSidebar from './report-sidebar'
import {
  exportReportAsDOCX,
  exportReportAsPDF,
} from './report_utils/report-export'
import { createReport, fetchAnalytics } from './report_utils/report.services'

const ReportCreationModel = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [blocks, setBlocks] = useState<ReportBlock[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [reportName, setReportName] = useState<string>('Untitled report')
  const [creating, setCreating] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsCard[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // Fetch analytics when modal opens
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoadingAnalytics(true)
        const response = await fetchAnalytics()
        if (response.cards) {
          setAnalytics(response.cards)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        toast.error('Failed to load analytics')
      } finally {
        setLoadingAnalytics(false)
      }
    }
    
    if (isOpen) {
      loadAnalytics()
      // Reset form when opening
      setBlocks([])
      setReportName('Untitled report')
    }
  }, [isOpen])

  // Selected analytics IDs
  const selectedIds = useMemo(
    () =>
      blocks
        .filter((b) => b.kind === 'analytics')
        .map((b) => (b as any).analyticsId),
    [blocks]
  )

  const addTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: 'text',
        text: '',
      },
    ])
  }

  const toggleAnalytic = (id: string) => {
    const existsIndex = blocks.findIndex(
      (b) => b.kind === 'analytics' && (b as any).analyticsId === id
    )
    
    if (existsIndex >= 0) {
      // Remove analytics block
      setBlocks((prev) => prev.filter((_, i) => i !== existsIndex))
    } else {
      // Add analytics block
      const card = analytics.find((c) => c.id === id)
      if (!card) return
      
      setBlocks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'analytics',
          analyticsId: id,
          title: card.title,
          analyticsType: card.analyticsType,
          chartType: card.type === 'chart' ? (card.chartType as ChartType) : undefined,
        },
      ])
    }
  }

  const moveUp = (index: number) => {
    setBlocks((prev) => {
      if (index <= 0 || index >= prev.length) return prev
      const next = [...prev]
      const temp = next[index - 1]
      next[index - 1] = next[index]
      next[index] = temp
      return next
    })
  }

  const moveDown = (index: number) => {
    setBlocks((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev
      const next = [...prev]
      const temp = next[index + 1]
      next[index + 1] = next[index]
      next[index] = temp
      return next
    })
  }

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  const changeText = (index: number, text: string) => {
    setBlocks((prev) => {
      const next = [...prev]
      if (next[index]?.kind === 'text') {
        ;(next[index] as any).text = text
      }
      return next
    })
  }

  const setChartTypeForAnalyticId = (id: string, chartType: ChartType) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.kind === 'analytics' && (b as any).analyticsId === id
          ? { ...(b as any), chartType }
          : b
      )
    )
  }

  const setChartTypeAtIndex = (index: number, chartType: ChartType) => {
    setBlocks((prev) => {
      const next = [...prev]
      const b = next[index]
      if (b?.kind === 'analytics') {
        ;(b as any).chartType = chartType
      }
      return next
    })
  }

  const computeJSON = (): ReportJSON => {
    const columns = 2
    const positioned: PositionedBlock[] = blocks.map((b, idx) => {
      const row = Math.floor(idx / columns) + 1
      const col = (idx % columns) + 1
      return {
        ...(b as any),
        position: { row, col, index: idx },
      }
    })
    return {
      grid: { columns, gap: 16 },
      blocks: positioned,
      name: reportName,
    }
  }

  const handleGenerate = async () => {
    // Validation
    if (!reportName.trim()) {
      toast.error('Please enter a report name')
      return
    }

    if (blocks.length === 0) {
      toast.error('Please add at least one block to the report')
      return
    }

    try {
      setCreating(true)
      const json = computeJSON()
      
      const response = await createReport({
        name: json.name,
        grid: json.grid,
        blocks: json.blocks,
      })

      toast.success('Report created successfully')
      
      // Call success callback and close
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to create report:', error)
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to create report'
      toast.error(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const exportPDF = async () => {
    try {
      await exportReportAsPDF('live-report-canvas')
      toast.success('PDF exported successfully')
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  const exportDOCX = async () => {
    try {
      await exportReportAsDOCX('live-report-canvas')
      toast.success('DOCX exported successfully')
    } catch (error) {
      toast.error('Failed to export DOCX')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
      <div className="fixed top-0 right-0 z-50 flex h-full w-screen flex-col border-l border-none bg-white shadow-lg">
        {/* Header */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-between p-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer rounded-full"
                onClick={onClose}
                disabled={creating}
              >
                <ArrowLeft className="size-6 font-bold text-secondary" />
              </Button>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                aria-label="Report name"
                className="h-12 max-w-[340px] font-semibold"
                placeholder="Untitled report"
                disabled={creating}
              />
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              <Button
                variant="outline"
                className="h-10 bg-transparent"
                onClick={exportPDF}
                aria-label="Export report as PDF"
                disabled={creating}
              >
                <FileDown className="mr-2 h-4 w-4" /> Export PDF
              </Button>
              <Button
                variant="outline"
                className="h-10 bg-transparent"
                onClick={exportDOCX}
                aria-label="Export report as DOCX"
                disabled={creating}
              >
                <FileDown className="mr-2 h-4 w-4" /> Export DOCX
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer rounded-full"
                onClick={onClose}
                disabled={creating}
              >
                <X className="h-4 w-4 font-bold text-primary" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1">
          <ReportSidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
            selectedIds={selectedIds}
            onToggleAnalytic={toggleAnalytic}
            onAddTextBlock={addTextBlock}
            onSetChartType={setChartTypeForAnalyticId}
            analytics={analytics}
            loadingAnalytics={loadingAnalytics}
          />

          <div className="flex flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-auto">
              <ReportCanvas
                blocks={blocks}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
                onRemove={removeBlock}
                onChangeText={changeText}
                onChangeChartType={setChartTypeAtIndex}
                containerId="live-report-canvas"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-end p-5">
            <div className="flex flex-shrink-0 items-center gap-4">
              <Button
                className="hover:bg-secondary text-secondary h-11 w-[200px] cursor-pointer border border-gray-400 bg-white px-6 font-semibold hover:text-white"
                onClick={() => setPreviewOpen(true)}
                disabled={creating || blocks.length === 0}
              >
                Preview Report
              </Button>

              <Button
                className="hover:bg-secondary bg-primary h-11 w-[200px] cursor-pointer border border-gray-400 px-6 font-semibold text-white hover:text-white disabled:opacity-50"
                onClick={handleGenerate}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Generate Report'} <SparkleIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ReportPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        blocks={blocks}
      />
    </div>
  )
}

export default ReportCreationModel