export type ChartType = 'bar' | 'pie' | 'donut' 

export interface ReportBlock {
  id: string
  kind: 'analytics' | 'text'
  text?: string
  analyticsId?: string
  title?: string
  analyticsType?: 'standalone' | 'comparative'
  chartType?: ChartType
}

export interface PositionedBlock extends ReportBlock {
  position: {
    row: number
    col: number
    index: number
  }
}

export interface ReportJSON {
  name: string
  grid: {
    columns: number
    gap: number
  }
  blocks: PositionedBlock[]
}

export interface Report {
  id: number
  data: ReportJSON
  createdAt: string
  updatedAt: string
}

export interface AnalyticsCard {
  id: string
  type: 'basic' | 'chart'
  title: string
  insight?: string
  analyticsType: 'standalone' | 'comparative'
  metricType: 'count' | 'value'
  color?: string
  value?: string
  chartType?: ChartType
  data?: Array<{
    label: string
    value: number
    percentage: number
    color: string
  }>
}