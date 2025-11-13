

// ============= TYPES =============

import { apiClient } from "@/utils/api"

export interface ReportBlock {
  id: string
  kind: 'analytics' | 'text'
  text?: string
  analyticsId?: string
  title?: string
  analyticsType?: 'standalone' | 'comparative'
  chartType?: 'bar' | 'pie' | 'donut'
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

export interface CreateReportPayload {
  name: string
  grid?: {
    columns?: number
    gap?: number
  }
  blocks: PositionedBlock[]
}

export interface UpdateReportPayload {
  name?: string
  grid?: {
    columns?: number
    gap?: number
  }
  blocks?: PositionedBlock[]
}

export interface ShareReportPayload {
  email: string
  reports: Array<{ id: number }>
  expiry?: 15 | 30 | 90 | null
}

// ============= API FUNCTIONS =============

/**
 * Fetch all reports with populated analytics data
 * GET /reports
 */
export const fetchReports = async () => {
  const response = await apiClient.get('/reports')
  return response.data
}

/**
 * Get a single report by ID
 * GET /reports/:id
 */
export const fetchReportById = async (id: string | number) => {
  const response = await apiClient.get(`/reports/${id}`)
  return response.data
}

/**
 * Create a new report
 * POST /reports
 */
export const createReport = async (payload: CreateReportPayload) => {
  const response = await apiClient.post('/reports', payload)
  return response.data
}

/**
 * Update an existing report
 * PUT /reports/:id
 */
export const updateReport = async (id: string | number, payload: UpdateReportPayload) => {
  const response = await apiClient.put(`/reports/${id}`, payload)
  return response.data
}

/**
 * Delete a report (soft delete)
 * DELETE /reports/:id
 */
export const deleteReport = async (id: string | number) => {
  const response = await apiClient.delete(`/reports/${id}`)
  return response.data
}

/**
 * Share report(s) with a recipient via email
 * POST /reports/share
 */
export const shareReport = async (payload: ShareReportPayload) => {
  const response = await apiClient.post('/reports/share', payload)
  return response.data
}

/**
 * Fetch all analytics cards (for sidebar)
 * GET /analytics
 */
export const fetchAnalytics = async () => {
  const response = await apiClient.get('/analytics')
  return response.data
}