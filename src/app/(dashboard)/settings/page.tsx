'use client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mapToApiUnit, mapToDisplayUnit, usePreferences } from '@/hooks/usePreferences'
import { ArrowRight, Settings } from 'lucide-react'
import { useState } from 'react'
import CurrencyModel from './_components/currency-model'
import TimeZoneModel from './_components/time-zone-model'

const SettingsPage = () => {
  const { preferences, loading, updatePreferences } = usePreferences()
  const [isTimeZoneModelOpen, setIsTimeZoneModelOpen] = useState(false)
  const [isCurrencyModelOpen, setIsCurrencyModelOpen] = useState(false)

  const getDisplayCurrency = () => {
    const currencyCode = preferences?.defaultCurrency || 'INR'
    try {
      // return currency symbol (e.g. ₹) and formatted sample amount
      const symbol = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
      })
        .formatToParts(1)
        .find((p) => p.type === 'currency')?.value

      const sample = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: currencyCode,
      }).format(12345.67)

      return { symbol: symbol || currencyCode, sample }
    } catch {
      return { symbol: currencyCode, sample: `${currencyCode} 12,345.67` }
    }
  }

  const getDisplayTimezone = () => {
    const tz = preferences?.timezone || 'Asia/Kolkata'
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        timeZoneName: 'long',
      })
      const parts = formatter.formatToParts(new Date())
      return parts.find((p) => p.type === 'timeZoneName')?.value || tz
    } catch {
      return tz
    }
  }

  const getDisplayDateTime = () => {
    const tz = preferences?.timezone || 'Asia/Kolkata'
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: tz,
        dateStyle: 'medium',
        timeStyle: 'short',
      })
      return formatter.format(new Date())
    } catch {
      return new Date().toLocaleString()
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <Settings className="text-primary" />
        <h1 className="text-lg">General Settings</h1>
      </div>

      {/* initial content */}
      <div className="flex flex-col space-y-6 bg-white px-6 py-10">
        {/* Timezone */}
        <div className="flex items-center justify-between">
          <h1 className="w-xs">Time-zone</h1>
          <p className="flex-1 text-left font-medium">
            {preferences ? (
              <>
                {getDisplayTimezone()}
                <span className="pl-2 font-normal text-gray-400">
                  {getDisplayDateTime()}
                </span>
              </>
            ) : (
              '—'
            )}
          </p>
          <Button
            className="text-secondary hover:bg-secondary size-13 cursor-pointer bg-[#F2F2F2] shadow-md hover:text-white"
            onClick={() => setIsTimeZoneModelOpen(true)}
          >
            <ArrowRight />
          </Button>
        </div>

        {/* Currency */}
        <div className="flex items-center justify-between">
          <h1 className="w-xs">Currency</h1>
          <p className="flex-1 text-left font-medium">
            {preferences ? (
              <>
                {getDisplayCurrency().symbol}
                <span className="pl-2 font-normal text-gray-400">
                  {getDisplayCurrency().sample}
                </span>
              </>
            ) : (
              '—'
            )}
          </p>
          <Button
            className="text-secondary hover:bg-secondary size-13 cursor-pointer bg-[#F2F2F2] shadow-md hover:text-white"
            onClick={() => setIsCurrencyModelOpen(true)}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>

      {/* Area section */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <h1 className="text-lg">Area Unit</h1>
      </div>

      {/* Area content */}
      <div className="flex flex-col space-y-6 bg-white px-6 py-10">
        <div className="flex items-center justify-between">
          <h1>Land</h1>
          <div>
            <Select
              value={mapToDisplayUnit(preferences?.areaPreferences.land.unit ?? 'sq_ft')}
              onValueChange={async (value: string) => {
                if (!preferences) return
                const newPrefs = JSON.parse(JSON.stringify(preferences)) as typeof preferences
                newPrefs.areaPreferences.land.unit = mapToApiUnit(value)
                await updatePreferences(newPrefs)
              }}
            >
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="Acre">Acre</SelectItem>
                <SelectItem value="Hectare">Hectare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1>Plot</h1>
          <div>
            <Select
              value={mapToDisplayUnit(preferences?.areaPreferences.plot.unit ?? 'sq_ft')}
              onValueChange={async (value: string) => {
                if (!preferences) return
                const newPrefs = JSON.parse(JSON.stringify(preferences)) as typeof preferences
                newPrefs.areaPreferences.plot.unit = mapToApiUnit(value)
                await updatePreferences(newPrefs)
              }}
            >
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="Square feet">Square feet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1>Residential</h1>
          <div>
            <Select
              value={mapToDisplayUnit(preferences?.areaPreferences.residential.unit ?? 'sq_ft')}
              onValueChange={async (value: string) => {
                if (!preferences) return
                const newPrefs = JSON.parse(JSON.stringify(preferences)) as typeof preferences
                newPrefs.areaPreferences.residential.unit = mapToApiUnit(value)
                await updatePreferences(newPrefs)
              }}
            >
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="Square feet">Square feet</SelectItem>
                <SelectItem value="Square meter">Square meter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1>Commercial</h1>
          <div>
            <Select
              value={mapToDisplayUnit(preferences?.areaPreferences.commercial.unit ?? 'sq_ft')}
              onValueChange={async (value: string) => {
                if (!preferences) return
                const newPrefs = JSON.parse(JSON.stringify(preferences)) as typeof preferences
                newPrefs.areaPreferences.commercial.unit = mapToApiUnit(value)
                await updatePreferences(newPrefs)
              }}
            >
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="Square feet">Square feet</SelectItem>
                <SelectItem value="Square meter">Square meter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <TimeZoneModel
        isOpen={isTimeZoneModelOpen}
        onClose={() => setIsTimeZoneModelOpen(false)}
        currentTimezone={preferences?.timezone || ''}
        onSave={updatePreferences}
        preferences={preferences!}
      />
      <CurrencyModel
        isOpen={isCurrencyModelOpen}
        onClose={() => setIsCurrencyModelOpen(false)}
        currentCurrency={preferences?.defaultCurrency || ''}
        onSave={updatePreferences}
        preferences={preferences!}
      />
    </div>
  )
}

export default SettingsPage
