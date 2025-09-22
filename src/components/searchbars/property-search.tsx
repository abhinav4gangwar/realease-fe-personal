import { apiClient } from '@/utils/api'
import { LoaderCircle, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'

const PropertySearch = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  const performSearch = async (searchQuery: string) => {
    console.log('🚀 Starting search for:', searchQuery)
    setIsSearching(true)
  }

  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.get(
        `/dashboard/search/properties?q=${encodeURIComponent(searchQuery)}&autocomplete=true&limit=10`
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
    performSearch(suggestion.text)
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setShowDropdown(false)
      performSearch(query)
    }
  }

  return (
    <div className="mx-8 hidden max-w-6xl flex-1 lg:block">
      <div className="relative">
        <Search className="text-secondary absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform" />
        {isSearching && (
          <LoaderCircle className="text-primary absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform animate-spin" />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search Properties"
          className="h-13 w-full pl-12 font-semibold"
          value={query}
          onChange={handleInputChange}
          onFocus={() =>
            query.trim() && suggestions.length > 0 && setShowDropdown(true)
          }
          onKeyDown={handleKeyDown}
        />

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 h-50 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
          >
            {isLoading ? (
              <div className="text-primary flex h-full items-center justify-center px-4 py-2 text-sm">
                <LoaderCircle className="size-10 animate-spin" />
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="hover:text-primary cursor-pointer px-4 py-3 text-sm last:border-b-0 hover:bg-gray-100"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion.text}
                </div>
              ))
            ) : (
              query.trim() && (
                <div className="text-primary flex h-full items-center justify-center px-4 py-2 text-sm">
                  No Suggestions Found
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PropertySearch
