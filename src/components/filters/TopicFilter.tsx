import { TOPICS } from '../../config/topics'
import { useFilterStore } from '../../stores/filterStore'
import clsx from 'clsx'

export default function TopicFilter() {
  const { selectedTopics, toggleTopic, setTopics } = useFilterStore()

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-gray-200">
      <button
        onClick={() => setTopics([])}
        className={clsx(
          'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
          selectedTopics.length === 0
            ? 'bg-ink-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        All
      </button>

      {TOPICS.map((topic) => (
        <button
          key={topic.id}
          onClick={() => toggleTopic(topic.id)}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
            selectedTopics.includes(topic.id)
              ? 'text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
          style={
            selectedTopics.includes(topic.id)
              ? { backgroundColor: topic.color }
              : undefined
          }
        >
          {topic.label}
        </button>
      ))}
    </div>
  )
}
