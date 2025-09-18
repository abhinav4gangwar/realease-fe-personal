import { apiClient } from '@/utils/api'
import { LoaderCircle, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'

const DocumentSearch = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.get(
        `/dashboard/search/documents?q=${encodeURIComponent(searchQuery)}&autocomplete=true&limit=5`
      )
      setSuggestions(response.data.suggestions || [])
      setShowDropdown(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
      setShowDropdown(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionSelect = (suggestion) => {
    setQuery(suggestion.text)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  return (
    <div className="mx-8 hidden max-w-6xl flex-1 lg:block">
      <div className="relative">
        <Search className="text-secondary absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search Documents"
          className="h-13 w-full pl-12 font-semibold"
          value={query}
          onChange={handleInputChange}
          onFocus={() =>
            query.trim() && suggestions.length > 0 && setShowDropdown(true)
          }
        />

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-primary flex justify-center items-center h-full"><LoaderCircle className='size-8 animate-spin' /></div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="cursor-pointer px-4 py-3 text-sm last:border-b-0 hover:bg-gray-100"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.text}
                </div>
              ))
            ) : (
              query.trim() && (
                <div className="px-4 py-2 text-sm text-primary flex justify-center items-center h-full">No Suggestions Found</div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentSearch
