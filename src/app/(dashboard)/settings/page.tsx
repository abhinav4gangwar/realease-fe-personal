'use client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, Settings } from 'lucide-react'
import { useState } from 'react'
import CurrencyModel from './_components/currency-model'
import TimeZoneModel from './_components/time-zone-model'

const SettingsPage = () => {
  const [isTimeZoneModelOpen, setIsTimeZoneModelOpen] = useState(false)
  const [isCurrencyModelOpen, setIsCurrencyModelOpen] = useState(false)
  return (
    <div className="border border-gray-300 shadow-md">
      {/* header */}
      <div className="flex items-center gap-3 bg-[#F8F8F8] p-4">
        <Settings className="text-primary" />
        <h1 className="text-lg">General Settings</h1>
      </div>

      {/* initial content */}
      <div className="flex flex-col space-y-6 bg-white px-4 py-10">
        {/* Timezone */}
        <div className="flex items-center justify-between">
          <h1 className="w-xs">Time-zone</h1>
          <p className="flex-1 text-left font-medium">
            Indian Standard Time
            <span className="pl-2 font-normal text-gray-400">
              23 Aug, 2025 at 12:37PM
            </span>
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
            Indian Rupee
            <span className="pl-2 font-normal text-gray-400">₹12,345.67</span>
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
      <div className="flex flex-col space-y-6 bg-white px-4 py-10">
        <div className="flex items-center justify-between">
          <h1>Land</h1>
          <div>
            <Select>
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="acre">Acre</SelectItem>
                <SelectItem value="hectare">Hectare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1>Plot</h1>
          <div>
            <Select>
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="square-yard">Square yard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1>Residential</h1>
          <div>
            <Select>
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="square-feet">Square feet</SelectItem>
                <SelectItem value="square-meter">Square meter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h1>Commercial</h1>
          <div>
            <Select>
              <SelectTrigger className="w-[230px] font-semibold shadow-md">
                <SelectValue placeholder="Value" />
              </SelectTrigger>
              <SelectContent className="border-none">
                <SelectItem value="square-feet">Square feet</SelectItem>
                <SelectItem value="square-meter">Square meter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <TimeZoneModel
        isOpen={isTimeZoneModelOpen}
        onClose={() => setIsTimeZoneModelOpen(false)}
      />
      <CurrencyModel
        isOpen={isCurrencyModelOpen}
        onClose={() => setIsCurrencyModelOpen(false)}
      />
    </div>
  )
}

export default SettingsPage
