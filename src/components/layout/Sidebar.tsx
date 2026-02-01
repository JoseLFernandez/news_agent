import { TOPICS } from '../../config/topics'
import { useFilterStore } from '../../stores/filterStore'
import TrendingWidget from '../global/TrendingWidget'
import clsx from 'clsx'

export default function Sidebar() {
  const { selectedTopics, toggleTopic, dateRange, setDateRange, sources, toggleSource } =
    useFilterStore()

  return (
    <aside className="space-y-6">
      {/* Global Trending Widget */}
      <TrendingWidget />

      {/* Topics Section */}
      <section>
        <h3 className="font-serif font-bold text-lg border-b-2 border-ink-900 pb-2 mb-3">
          Topics
        </h3>
        <div className="space-y-1">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={clsx(
                'w-full text-left px-3 py-2 text-sm rounded transition-colors',
                selectedTopics.includes(topic.id)
                  ? 'bg-ink-900 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: topic.color }}
              />
              {topic.label}
            </button>
          ))}
        </div>
        {selectedTopics.length > 0 && (
          <button
            onClick={() => useFilterStore.getState().setTopics([])}
            className="mt-2 text-xs text-accent-red hover:underline"
          >
            Clear all topics
          </button>
        )}
      </section>

      {/* Date Range Section */}
      <section>
        <h3 className="font-serif font-bold text-lg border-b-2 border-ink-900 pb-2 mb-3">
          Time Period
        </h3>
        <div className="space-y-1">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value as typeof dateRange)}
              className={clsx(
                'w-full text-left px-3 py-2 text-sm rounded transition-colors',
                dateRange === option.value
                  ? 'bg-ink-900 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* Sources Section */}
      <section>
        <h3 className="font-serif font-bold text-lg border-b-2 border-ink-900 pb-2 mb-3">
          Sources
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes('medium')}
              onChange={() => toggleSource('medium')}
              className="rounded border-gray-300 text-ink-900 focus:ring-ink-900"
            />
            <span className="text-sm text-gray-700">Medium</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes('gdelt')}
              onChange={() => toggleSource('gdelt')}
              className="rounded border-gray-300 text-ink-900 focus:ring-ink-900"
            />
            <span className="text-sm text-gray-700">GDELT</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes('finance')}
              onChange={() => toggleSource('finance')}
              className="rounded border-gray-300 text-ink-900 focus:ring-ink-900"
            />
            <span className="text-sm text-gray-700">Finance News</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes('ft')}
              onChange={() => toggleSource('ft')}
              className="rounded border-gray-300 text-ink-900 focus:ring-ink-900"
            />
            <span className="text-sm text-gray-700">Financial Times</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sources.includes('myft')}
              onChange={() => toggleSource('myft')}
              className="rounded border-gray-300 text-ink-900 focus:ring-ink-900"
            />
            <span className="text-sm text-gray-700">MyFT (Personalized)</span>
          </label>
          <label className="flex items-center gap-2 cursor-not-allowed opacity-60">
            <input
              type="checkbox"
              checked={sources.includes('perplexity')}
              onChange={() => {}}
              disabled
              className="rounded border-gray-300 text-ink-900 focus:ring-ink-900"
            />
            <span className="text-sm text-gray-700">Perplexity (intel only)</span>
          </label>
        </div>
      </section>
    </aside>
  )
}
