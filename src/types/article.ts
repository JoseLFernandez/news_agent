export type ArticleSource =
  | 'medium'
  | 'gdelt'
  | 'perplexity'
  | 'finance'
  | 'ft'
  | 'myft'
  | (string & {})

export interface Article {
  id: string
  title: string
  summary: string
  content?: string
  url: string
  image?: string
  author?: string
  publishedAt: Date
  source: ArticleSource
  topics: string[]
  /** ISO-3166-1 alpha-2 country code when available (e.g. "US", "GB"). */
  country?: string
  readTime?: number
}

export interface RSSFeedItem {
  id: string
  title: string
  link: string
  pubDate: string
  creator?: string
  content?: string
  contentSnippet?: string
  categories: string[]
  enclosure?: {
    url: string
    type?: string
  }
}

export interface RSSFeed {
  title: string
  description?: string
  link: string
  items: RSSFeedItem[]
}

export interface PerplexityResponse {
  id: string
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  citations?: string[]
  related_questions?: string[]
}
