"use client"
import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { Header } from "./_components/header"
import MobileHeader from "./_components/mobile-header"
import { Sidebar } from "./_components/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const { isAuthenticated } = useAuth()
  if (isAuthenticated == false) {
    return(
      <div>
        Loading.....
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <MobileHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="lg:mx-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
