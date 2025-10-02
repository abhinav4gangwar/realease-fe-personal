"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dummyAnalytics } from "@/lib/analytics.dummy"
import { ChartType, PositionedBlock, ReportBlock, ReportJSON } from "@/types/report-types"
import { SparkleIcon, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import ReportCanvas from "./report-canvas"
import ReportSidebar from "./report-sidebar"


export function toBlocks(positioned: PositionedBlock[]): ReportBlock[] {
  return positioned.map(({ position, ...rest }) => rest as ReportBlock)
}

export default function ReportEditModal({
  isOpen,
  onClose,
  initial,
}: {
  isOpen: boolean
  onClose: () => void
  initial: any
}) {
  const [name, setName] = useState<string>(initial?.data?.name || "Untitled report")
  const [blocks, setBlocks] = useState<ReportBlock[]>(() => 
    initial?.data?.blocks ? toBlocks(initial.data.blocks) : []
  )
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (initial?.data) {
      setName(initial.data.name || "Untitled report")
      setBlocks(initial.data.blocks ? toBlocks(initial.data.blocks) : [])
    }
  }, [initial])

 

  const selectedIds = useMemo(
    () => blocks.filter((b) => b.kind === "analytics").map((b) => (b as any).analyticsId),
    [blocks],
  )

  const addTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: "text",
        text: "",
      },
    ])
  }

  const toggleAnalytic = (id: string) => {
    const existsIndex = blocks.findIndex((b) => b.kind === "analytics" && (b as any).analyticsId === id)
    if (existsIndex >= 0) {
      setBlocks((prev) => prev.filter((_, i) => i !== existsIndex))
      return
    }
    const card = dummyAnalytics.cards.find((c) => c.id === id)
    if (!card) return
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        kind: "analytics",
        analyticsId: id,
        title: card.title,
        analyticsType: card.type as any,
        chartType: (card as any).chartType,
      },
    ])
  }

  const setChartTypeForAnalyticId = (id: string, chartType: ChartType) => {
    setBlocks((prev) =>
      prev.map((b) => (b.kind === "analytics" && (b as any).analyticsId === id ? { ...(b as any), chartType } : b)),
    )
  }

  const moveUp = (index: number) => {
    setBlocks((prev) => {
      if (index <= 0 || index >= prev.length) return prev
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  const moveDown = (index: number) => {
    setBlocks((prev) => {
      if (index < 0 || index >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
      return next
    })
  }

  const removeBlock = (index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index))
  }

  const changeText = (index: number, text: string) => {
    setBlocks((prev) => {
      const next = [...prev]
      if (next[index]?.kind === "text") {
        ;(next[index] as any).text = text
      }
      return next
    })
  }

  const setChartTypeAtIndex = (index: number, chartType: ChartType) => {
    setBlocks((prev) => {
      const next = [...prev]
      const b = next[index]
      if (b?.kind === "analytics") {
        ;(b as any).chartType = chartType
      }
      return next
    })
  }

  const computeJSON = (): ReportJSON => {
    const columns = initial?.data?.grid?.columns || 2
    const positioned = blocks.map((b, idx) => ({
      ...(b as any),
      position: { row: Math.floor(idx / columns) + 1, col: (idx % columns) + 1, index: idx },
    }))
    return {
      name,
      grid: { columns, gap: initial?.data?.grid?.gap ?? 16 },
      blocks: positioned,
    }
  }

  const handleGenerate = () => {
    const json = computeJSON()
    console.log("[Report Updated]", JSON.stringify(json, null, 2))
  }

  if (!isOpen) return null

  return (
   <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
      <div className="fixed top-0 right-0 z-50 flex h-full w-screen flex-col border-l border-none bg-white shadow-lg">
        {/* Header */}
        <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-between p-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
               <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Report name"
              className="h-10 max-w-[340px]"
              placeholder="Untitled report"
            />
            </div>
            <div className="flex flex-shrink-0 items-center gap-3">
              
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                onClick={onClose}
              >
                <X className="h-4 w-4 font-bold" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          <ReportSidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
            selectedIds={selectedIds}
            onToggleAnalytic={toggleAnalytic}
            onAddTextBlock={addTextBlock}
            onSetChartType={setChartTypeForAnalyticId}
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
                containerId="edit-report-canvas"
              />
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
          <div className="flex items-center justify-end p-5">
            <div className="flex flex-shrink-0 items-center gap-4">
              <Button
                className="hover:bg-secondary text-secondary h-11 w-[200px] cursor-pointer border border-gray-400 bg-white px-6 font-semibold hover:text-white"
                onClick={onClose}
              >
                Back To Reports
              </Button>

              <Button
                className="hover:bg-secondary bg-primary h-11 w-[200px] cursor-pointer border border-gray-400 px-6 font-semibold text-white hover:text-white"
                onClick={handleGenerate}
              >
                Generate Report <SparkleIcon />
              </Button>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
