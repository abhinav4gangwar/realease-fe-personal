export type ChartType = "bar" | "pie" | "donut"

export type ReportBlock =
  | {
      id: string
      kind: "analytics"
      analyticsId: string
      title: string
      analyticsType: "basic" | "chart"
      chartType?: ChartType
    }
  | {
      id: string
      kind: "text"
      text: string
    }

export type PositionedBlock = ReportBlock & {
  position: { row: number; col: number; index: number }
}

export interface ReportJSON {
  grid: { columns: number; gap: number }
  blocks: PositionedBlock[]
  name?: string
}
