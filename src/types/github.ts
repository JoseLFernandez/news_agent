export interface GitHubTopic {
  name: string
  displayName: string
  shortDescription: string
  description: string
  createdBy: string
  relatedTopics: string[]
  featured: boolean
}

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  owner: {
    login: string
    avatarUrl: string
  }
  description: string
  url: string
  stars: number
  forks: number
  language: string | null
  topics: string[]
  updatedAt: string
}

export interface GitHubRateLimit {
  remaining: number
  limit: number
  resetAt: Date
}

export interface GitHubTopicsResponse {
  topics: GitHubTopic[]
  rateLimit?: GitHubRateLimit
}

export interface GitHubReposResponse {
  repositories: GitHubRepository[]
  totalCount: number
  rateLimit?: GitHubRateLimit
}
