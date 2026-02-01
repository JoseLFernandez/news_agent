import type { BiasIndicator } from '../../types/storyCluster'

interface BiasIndicatorBadgeProps {
  indicator: BiasIndicator
  compact?: boolean
}

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  sentiment: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: '📊',
  },
  framing: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    icon: '🏷️',
  },
  omission: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: '⚠️',
  },
  emphasis: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    icon: '🔍',
  },
  source_lean: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    icon: '📰',
  },
}

export default function BiasIndicatorBadge({
  indicator,
  compact = false,
}: BiasIndicatorBadgeProps) {
  const style = TYPE_STYLES[indicator.type] || TYPE_STYLES.framing

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text}`}
        title={indicator.signal}
      >
        <span>{style.icon}</span>
        <span className="capitalize">{indicator.type.replace('_', ' ')}</span>
      </span>
    )
  }

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded-md ${style.bg}`}
    >
      <span className="text-sm flex-shrink-0">{style.icon}</span>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-medium ${style.text}`}>
          {indicator.signal}
        </div>
        {indicator.evidence && (
          <div className="text-xs text-gray-600 mt-0.5">
            "{indicator.evidence}"
          </div>
        )}
        <div className="text-xs text-gray-500 mt-0.5">
          {Math.round(indicator.confidence * 100)}% confidence
        </div>
      </div>
    </div>
  )
}
