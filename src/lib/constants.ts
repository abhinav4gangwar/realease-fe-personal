export const APP_CONFIG = {
  name: 'RealEase',
  description: 'Modern real estate management platform',
  version: '1.0.0',
} as const

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  properties: {
    list: '/properties',
    create: '/properties',
    update: (id: string) => `/properties/${id}`,
    delete: (id: string) => `/properties/${id}`,
    search: '/properties/search',
  },
  users: {
    profile: '/users/profile',
    update: '/users/profile',
  },
} as const

export const ROUTES = {
  home: '/',
  auth: {
    login: '/login',
    register: '/register',
  },
  dashboard: {
    home: '/dashboard',
    properties: '/dashboard/properties',
    clients: '/dashboard/clients',
    analytics: '/dashboard/analytics',
  },
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const STORAGE_KEYS = {
  auth: 'realease_auth',
  theme: 'realease_theme',
  preferences: 'realease_preferences',
} as const

export const PROPERTY_TYPES = [
  'residential',
  'commercial',
  'industrial',
  'land',
  'multi-family',
] as const

export const PROPERTY_STATUS = [
  'available',
  'pending',
  'sold',
  'rented',
  'off-market',
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]
export type PropertyStatus = (typeof PROPERTY_STATUS)[number] 