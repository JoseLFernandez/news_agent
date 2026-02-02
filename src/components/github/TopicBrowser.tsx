import { useState } from 'react'
import type { GitHubTopic } from '../../types/github'

interface TopicBrowserProps {
  topics: GitHubTopic[]
  selectedTopic: string | null
  onSelectTopic: (topic: string) => void
  onSearch: (query: string) => void
  isLoading: boolean
}

export function TopicBrowser({
  topics,
  selectedTopic,
  onSelectTopic,
  onSearch,
  isLoading
}: TopicBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse Topics</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {topics.map((topic) => (
            <button
              key={topic.name}
              onClick={() => onSelectTopic(topic.name)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedTopic === topic.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={topic.shortDescription}
            >
              {topic.displayName}
            </button>
          ))}
          {topics.length === 0 && (
            <p className="text-gray-500 text-sm">No topics found. Try a different search.</p>
          )}
        </div>
      )}
    </div>
  )
}
