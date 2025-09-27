'use client'

import { createContext, useContext, useState } from 'react'

export interface GlobalContextType {
  analyticsState: string
  setAnalyticsState: (state: string) => void
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const GlobalContextProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [analyticsState, setAnalyticsState] = useState<string>('analytics')
  return (
    <GlobalContext.Provider value={{ analyticsState, setAnalyticsState }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalContextProvider = () => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobalContextProvider must be used inside GlobalContextProvider')
  }
  return context
}
