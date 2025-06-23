
import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Bell as SearchIcon, X } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  suggestions?: string[]
  className?: string
}

export const SearchInput = ({ 
  placeholder = "Search...", 
  onSearch, 
  suggestions = [],
  className 
}: SearchInputProps) => {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5)

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        onSearch(query)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [query, onSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        setQuery(filteredSuggestions[selectedIndex])
        setShowSuggestions(false)
      }
      onSearch(query)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    onSearch(suggestion)
    inputRef.current?.focus()
  }

  const clearSearch = () => {
    setQuery('')
    setShowSuggestions(false)
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-md last:rounded-b-md',
                index === selectedIndex && 'bg-gray-50'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
