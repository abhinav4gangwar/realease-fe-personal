import SettingsSidebar from './_components/settings-sidebar'

const SettingsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <SettingsSidebar />

      <div className="flex-1 p-6 overflow-y-auto no-scrollbar">{children}</div>
    </div>
  )
}

export default SettingsLayout
