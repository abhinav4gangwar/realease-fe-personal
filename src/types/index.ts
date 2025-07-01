export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'agent' | 'client'
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  title: string
  description: string
  type: 'residential' | 'commercial' | 'industrial' | 'land' | 'multi-family'
  status: 'available' | 'pending' | 'sold' | 'rented' | 'off-market'
  price: number
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  features: {
    bedrooms?: number
    bathrooms?: number
    sqft: number
    lotSize?: number
    yearBuilt?: number
  }
  images: string[]
  agentId: string
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  preferences: {
    propertyTypes: string[]
    priceRange: {
      min: number
      max: number
    }
    locations: string[]
  }
  agentId: string
  createdAt: string
  updatedAt: string
} 

export interface QuickAction {
  id: string
  label: string
  value: string
}