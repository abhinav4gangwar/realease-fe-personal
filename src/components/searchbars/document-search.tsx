import { useSearchContext } from '@/providers/doc-search-context'
import { apiClient } from '@/utils/api'
import { LoaderCircle, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { FileIcon } from '../ui/file-icon'

interface SearchSuggestion {
  text: string
  mimeType: string
  type: 'suggestion'
}

const DocumentSearch = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { setSearchResults, setSearchQuery, clearSearchResults } =
    useSearchContext()

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      clearSearchResults()
      return
    }

    console.log('🚀 Starting search for:', searchQuery)
    setIsSearching(true)

    try {
      const response = await apiClient.get(
        `/dashboard/search/documents?q=${encodeURIComponent(searchQuery)}`
      )
      setSearchResults(response.data)
      setSearchQuery(searchQuery)
    } catch (error) {
      toast.error('❌ Error performing search:', error)
      clearSearchResults()
    } finally {
      setIsSearching(false)
      toast.message('Showing Searched Results')
    }
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text)
    setShowDropdown(false)
    inputRef.current?.focus()
    performSearch(suggestion.text)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setShowDropdown(false)
      performSearch(query)
    }
  }

  return (
    <div className="lg:mx-8 max-w-6xl flex-1">
      <div className="relative">
        <Search className="text-secondary absolute top-1/2 left-3 h-6 w-6 -translate-y-1/2 transform" />
        {isSearching && (
          <LoaderCircle className="text-primary absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 transform animate-spin" />
        )}
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
          onKeyDown={handleKeyDown}
        />

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-50 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
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
                  <div className="flex items-center gap-3">
                    <FileIcon
                      mimeType={suggestion.mimeType}
                      size={18}
                      className="flex-shrink-0"
                    />
                    <span className="truncate">{suggestion.text}</span>
                  </div>
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

export default DocumentSearch
