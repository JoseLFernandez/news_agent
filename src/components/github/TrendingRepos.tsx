import type { GitHubRepository } from '../../types/github'

interface TrendingReposProps {
  repositories: GitHubRepository[]
  isLoading: boolean
  title?: string
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
  }
  return colors[language || ''] || '#8b949e'
}

function RepoCard({ repo }: { repo: GitHubRepository }) {
  const updatedDate = new Date(repo.updatedAt)
  const daysAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24))
  const updatedText = daysAgo === 0 ? 'today' : daysAgo === 1 ? 'yesterday' : `${daysAgo} days ago`

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <img
          src={repo.owner.avatarUrl}
          alt={repo.owner.login}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-blue-600 hover:underline truncate">
            {repo.fullName}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {repo.description || 'No description provided'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {formatNumber(repo.stars)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {formatNumber(repo.forks)}
            </span>
            <span className="text-gray-400">
              Updated {updatedText}
            </span>
          </div>

          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {repo.topics.slice(0, 5).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {topic}
                </span>
              ))}
              {repo.topics.length > 5 && (
                <span className="px-2 py-0.5 text-gray-400 text-xs">
                  +{repo.topics.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  )
}

export function TrendingRepos({ repositories, isLoading, title = 'Repositories' }: TrendingReposProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">{repositories.length} repositories</span>
      </div>

      {repositories.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No repositories found</p>
      ) : (
        <div className="space-y-4">
          {repositories.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  )
}
