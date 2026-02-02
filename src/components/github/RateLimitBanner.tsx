import type { GitHubRateLimit } from '../../types/github'

interface RateLimitBannerProps {
  rateLimit: GitHubRateLimit | null | undefined
}

export function RateLimitBanner({ rateLimit }: RateLimitBannerProps) {
  if (!rateLimit) return null

  const percentage = (rateLimit.remaining / rateLimit.limit) * 100
  const isLow = percentage < 20
  const resetTime = new Date(rateLimit.resetAt)
  const minutesUntilReset = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 60000))

  if (!isLow) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-amber-800 text-sm font-medium">
          API Rate Limit: {rateLimit.remaining}/{rateLimit.limit} requests remaining
        </span>
        <span className="text-amber-600 text-sm">
          (resets in {minutesUntilReset} min)
        </span>
      </div>
    </div>
  )
}
