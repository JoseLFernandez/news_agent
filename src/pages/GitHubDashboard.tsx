import { useState } from 'react'
import { useGitHubTopics, useGitHubReposByTopic, useGitHubTrending } from '../api/github'
import { TopicBrowser } from '../components/github/TopicBrowser'
import { TrendingRepos } from '../components/github/TrendingRepos'
import { RateLimitBanner } from '../components/github/RateLimitBanner'

type SortOption = 'stars' | 'forks' | 'updated'
type TrendingPeriod = 'daily' | 'weekly' | 'monthly'

export function GitHubDashboard() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('stars')
  const [trendingPeriod, setTrendingPeriod] = useState<TrendingPeriod>('weekly')

  const { data: topicsData, isLoading: topicsLoading } = useGitHubTopics(searchQuery)
  const { data: reposData, isLoading: reposLoading } = useGitHubReposByTopic(
    selectedTopic || '',
    sortBy
  )
  const { data: trendingData, isLoading: trendingLoading } = useGitHubTrending(trendingPeriod)

  const rateLimit = reposData?.rateLimit || topicsData?.rateLimit || trendingData?.rateLimit

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic === selectedTopic ? null : topic)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedTopic(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">GitHub Topics</h1>
        <p className="text-gray-600 mt-1">
          Explore trending repositories and discover projects by topic
        </p>
      </div>

      <RateLimitBanner rateLimit={rateLimit} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopicBrowser
            topics={topicsData?.topics || []}
            selectedTopic={selectedTopic}
            onSelectTopic={handleTopicSelect}
            onSearch={handleSearch}
            isLoading={topicsLoading}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedTopic ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTopic.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="stars">Stars</option>
                    <option value="forks">Forks</option>
                    <option value="updated">Recently Updated</option>
                  </select>
                </div>
              </div>
              <TrendingRepos
                repositories={reposData?.repositories || []}
                isLoading={reposLoading}
                title={`Top ${selectedTopic} repositories`}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Trending Repositories</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Period:</label>
                  <select
                    value={trendingPeriod}
                    onChange={(e) => setTrendingPeriod(e.target.value as TrendingPeriod)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Today</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                  </select>
                </div>
              </div>
              <TrendingRepos
                repositories={trendingData?.repositories || []}
                isLoading={trendingLoading}
                title="Trending this week"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
