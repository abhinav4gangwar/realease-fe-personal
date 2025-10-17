'use client'

import { basicPlanFeatures } from '@/lib/planAccess.dummy'
import { createContext, useContext, useState } from 'react'

export interface GlobalContextType {
  analyticsState: string
  setAnalyticsState: (state: string) => void
  accessControlState: string
  setAccessControlState: (state: string) => void
  planAccessValues: string[]
  setPalnAccessValues: unknown
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const GlobalContextProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [analyticsState, setAnalyticsState] = useState<string>('analytics')
  const [accessControlState, setAccessControlState] = useState<string>('permissions')
  const [planAccessValues, setPalnAccessValues] = useState(basicPlanFeatures)
  
  return (
    <GlobalContext.Provider
      value={{
        analyticsState,
        setAnalyticsState,
        accessControlState,
        setAccessControlState,
        planAccessValues,
        setPalnAccessValues
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContextProvider = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error(
      'useGlobalContextProvider must be used inside GlobalContextProvider'
    )
  }
  return context
}
