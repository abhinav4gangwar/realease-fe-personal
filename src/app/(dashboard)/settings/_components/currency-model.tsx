import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Preferences } from '@/hooks/usePreferences'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'

// Get all ISO 4217 currency codes supported by Intl
const currencies = Intl.supportedValuesOf('currency')

function getReadableCurrencyName(currency: string) {
  try {
    const formatter = new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      currencyDisplay: 'name',
    })
    const parts = formatter.formatToParts(1)
    const name = parts.find((p) => p.type === 'currency')?.value
    return name || currency
  } catch {
    return currency
  }
}

const CurrencyModel = ({
  isOpen,
  onClose,
  currentCurrency,
  onSave,
  preferences,
}: {
  isOpen: boolean
  onClose: () => void
  currentCurrency: string
  onSave: (preferences: Preferences) => Promise<boolean>
  preferences: Preferences
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currentCurrency)
  const [searchQuery, setSearchQuery] = useState('')

  // Precompute readable currency names
  const currenciesWithNames = useMemo(
    () =>
      currencies.map((cur) => ({
        id: cur,
        name: getReadableCurrencyName(cur),
      })),
    []
  )

  // Filter based on search query
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return currenciesWithNames.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    )
  }, [searchQuery, currenciesWithNames])

  const handleSave = async () => {
    const newPreferences = { ...preferences }
    newPreferences.defaultCurrency = selectedCurrency
    await onSave(newPreferences)
    onClose()
  }

  const handleCancel = () => {
    setSelectedCurrency(currentCurrency)
    setSearchQuery('')
  }

  return (
    <>
      {isOpen && (
        <div className="fixed top-0 right-0 z-50 h-full w-full bg-black/30">
          <div className="fixed top-0 right-0 z-50 flex h-full w-[550px] flex-col border-l border-none bg-white shadow-lg">
            {/* Header */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-between p-5">
                <h2 className="truncate pl-1 text-xl font-semibold">
                  Select Currency
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary h-6 w-6 cursor-pointer rounded-full bg-[#CDCDCE] text-white"
                  onClick={onClose}
                >
                  <X className="h-4 w-4 font-bold" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <Input
                type="text"
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-full"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <ul className="space-y-2">
                {filteredCurrencies.map((cur) => (
                  <li
                    key={cur.id}
                    className={`cursor-pointer rounded-md p-3 transition-colors ${
                      selectedCurrency === cur.id
                        ? ' bg-[#A2CFE333]'
                        : ' hover:bg-[#A2CFE333]'
                    }`}
                    onClick={() => setSelectedCurrency(cur.id)}
                  >
                    <div className="font-semibold text-md">
                      {cur.name}
                    </div>
                  </li>
                ))}
                {filteredCurrencies.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-5">
                    No currencies found.
                  </p>
                )}
              </ul>
            </div>

            {/* Footer */}
            <div className="bg-[#F2F2F2] shadow-md">
              <div className="flex items-center justify-end p-5">
                <div className="flex flex-shrink-0 items-center gap-5">
                  <Button
                    className="bg-white border border-gray-400 text-secondary hover:text-white h-11 w-[150px] cursor-pointer px-6 hover:bg-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>

                  <Button
                    disabled={!selectedCurrency}
                    className="bg-secondary hover:text-secondary h-11 w-[150px] cursor-pointer px-6 hover:bg-white hover:border"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CurrencyModel
