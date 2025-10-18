'use client'


import { createContext, useContext, useState } from 'react'

export interface GlobalContextType {
  analyticsState: string
  setAnalyticsState: (state: string) => void
  accessControlState: string
  setAccessControlState: (state: string) => void
  planAccessValues: string[]
  setPlanAccessValues: (values: string[]) => void
  accountDetails: unknown
  setAccountDetails: (values : any) => void

}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const GlobalContextProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [analyticsState, setAnalyticsState] = useState<string>('analytics')
  const [accessControlState, setAccessControlState] = useState<string>('permissions')
  const [planAccessValues, setPlanAccessValues] = useState<string[]>([])
  const [accountDetails, setAccountDetails] = useState()
  
  return (
    <GlobalContext.Provider
      value={{
        analyticsState,
        setAnalyticsState,
        accessControlState,
        setAccessControlState,
        planAccessValues,
        setPlanAccessValues,
        accountDetails,
        setAccountDetails
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