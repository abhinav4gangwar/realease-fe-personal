'use client'
import ChangePasswordModal, {
  useDefaultPasswordCheck,
} from '@/components/permission-control/change-password-model'
import { IncompletePersonalDetailsModal } from '@/components/permission-control/incomplete-personal-details-model'
import { useAuth } from '@/hooks/useAuth'
import { useGlobalContextProvider } from '@/providers/global-context'
import { apiClient } from '@/utils/api'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Header } from './_components/header'
import MobileHeader from './_components/mobile-header'
import { Sidebar } from './_components/sidebar'
import SubscriptionPopup from './_components/subscription-required-popup'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const { isAuthenticated } = useAuth()
  const { setPlanAccessValues, setAccountDetails, setUserType } =
    useGlobalContextProvider()
  const { showModal, setShowModal } = useDefaultPasswordCheck()

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await apiClient.get('/payments/features')

        if (response.data.success && response.data.data.features) {
          setPlanAccessValues(response.data.data.features)
          setUserType(response.data.data.userType)
        }
      } catch (error) {
        console.error('Failed to fetch features:', error)
      }
    }

    if (isAuthenticated) {
      fetchFeatures()
    }
  }, [isAuthenticated, setPlanAccessValues, setUserType])

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await apiClient.get('/settings')

        if (response.data.success && response.data.data) {
          setAccountDetails(response.data.data)
        }
      } catch (error) {
        console.error('Failed to fetch account details:', error)
      }
    }

    if (isAuthenticated) {
      fetchAccountDetails()
    }
  }, [isAuthenticated, setAccountDetails])

  if (isAuthenticated == false) {
    return <div>Loading.....</div>
  }

  const isSettingsPage = pathname.startsWith('/settings')
  const isPricingPage = pathname === '/pricing'
  const isMapsPage = pathname.startsWith('/maps')
  const isFullWidthPage = isSettingsPage || isMapsPage

  return (
    <div className="flex h-screen bg-gray-100">
      {!isPricingPage && <SubscriptionPopup />}
      <IncompletePersonalDetailsModal />
      <ChangePasswordModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <MobileHeader />

        <main
          className={`flex-1 overflow-auto ${isFullWidthPage ? 'p-0' : 'p-6'}`}
        >
          <div className={`${isFullWidthPage ? 'lg:mx-0' : 'lg:mx-8'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
