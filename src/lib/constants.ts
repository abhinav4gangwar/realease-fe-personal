import { QuickAction } from '@/types'
import { PermissionGroup } from '@/types/permission.types'
import {
  BarChart3,
  Building2,
  FileText,
  History,
  LayoutGrid,
  MapPin,
  MessageSquareDot,
  ReceiptText,
  RectangleEllipsis,
  Search,
  Settings,
  ShieldAlert,
  ShieldBan,
  Trash,
  UserPen,
} from 'lucide-react'

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

export const SettingsnavigationItems = [
  { icon: Settings, label: 'General', href: '/settings' },
  {
    icon: UserPen,
    label: 'Account Details',
    href: '/settings/account-details',
  },
  {
    icon: ShieldBan,
    label: 'Access Control',
    href: '/settings/access-control',
  },
  {
    icon: MessageSquareDot,
    label: 'Notification Controls',
    href: '/settings/notification-controls',
  },
  {
    icon: History,
    label: 'Activity Log',
    href: '/settings/activity-log',
  },
  {
    icon: RectangleEllipsis,
    label: 'Password',
    href: '/settings/password-settings',
  },
  {
    icon: ShieldAlert,
    label: 'Privacy Policy',
    href: '/settings/privacy-policy',
  },
  {
    icon: ReceiptText,
    label: 'Terms of Services',
    href: '/settings/terms-of-services',
  },
]

export const navigationItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '/' },
  { icon: MapPin, label: 'Maps', href: '/maps' },
  { icon: Building2, label: 'Properties', href: '/properties' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Documents', href: '/documents' },
  { icon: Trash, label: 'Trash', href: '/trash' },
]

export const MobileNavigationItems = [
  { icon: Search, label: 'Search', href: '/' },
  { icon: MapPin, label: 'Maps', href: '/maps' },
  { icon: Building2, label: 'Properties', href: '/properties' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Documents', href: '/documents' },
]

export const navigationItemSection = [
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export const QUICK_ACTIONS_HOME: QuickAction[] = [
  { id: '1', label: 'Bulk Upload', value: 'bulk_upload' },
  { id: '2', label: 'Share Docs', value: 'share_docs' },
  { id: '3', label: 'Add Members', value: 'add_members' },
  { id: '4', label: 'Access Controls', value: 'access_controls' },
  { id: '5', label: 'Create Report', value: 'create_report' },
]

export const QUICK_ACTIONS_DOCS: QuickAction[] = [
  { id: '1', label: 'Add Docs', value: 'add_docs' },
  { id: '2', label: 'Share Docs', value: 'share_docs' },
]

export type PropertyType = (typeof PROPERTY_TYPES)[number]
export type PropertyStatus = (typeof PROPERTY_STATUS)[number]

export const permissionGroups: PermissionGroup[] = [
  {
    id: 'asset',
    label: 'Asset Document Access',
    items: [
      { id: 'asset.upload', label: 'Upload' },
      { id: 'asset.view', label: 'View' },
      { id: 'asset.edit', label: 'Edit' },
      { id: 'asset.download', label: 'Download' },
    ],
  },
  {
    id: 'location',
    label: 'Location and Map Access',
    items: [
      { id: 'location.view', label: 'View' },
      { id: 'location.edit', label: 'Edit' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics Access',
    items: [
      { id: 'analytics.create', label: 'Create' },
      { id: 'analytics.view', label: 'View' },
      { id: 'analytics.edit', label: 'Edit' },
      { id: 'analytics.download', label: 'Download' },
    ],
  },
  {
    id: 'users',
    label: 'User and Role Management',
    items: [
      { id: 'users.view', label: 'View Current Roles/Users' },
      { id: 'users.edit', label: 'Edit/Create Roles' },
      { id: 'users.add', label: 'Add/Remove Team Members' },
    ],
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    items: [{ id: 'audit.view', label: 'View Activity Logs' }],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { id: 'settings.edit', label: 'Edit/Change Password' },
      { id: 'settings.delete', label: 'Delete Account' },
    ],
  },
];

export const DUMMY_CARD_NO="4718 6091 0820 4366";