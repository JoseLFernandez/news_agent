import type { SearchResult } from './search'

/**
 * Types of bias signals that can be detected in an article.
 */
export type BiasType =
  | 'sentiment'    // Overall positive/negative tone
  | 'framing'      // Use of loaded language
  | 'omission'     // Facts missing compared to other sources
  | 'emphasis'     // What aspects are highlighted
  | 'source_lean'  // Known editorial lean of the source

/**
 * A single bias signal detected in an article.
 */
export interface BiasIndicator {
  type: BiasType
  signal: string
  confidence: number  // 0-1
  evidence?: string   // Supporting quote or keyword
}

/**
 * Bias analysis profile for a single article.
 */
export interface ArticleBiasProfile {
  articleId: string
  sentimentScore: number  // -1 (negative) to +1 (positive)
  framingKeywords: string[]
  emphasis: string[]
  indicators: BiasIndicator[]
}

/**
 * A group of articles covering the same underlying news event,
 * with comparative bias analysis.
 */
export interface StoryCluster {
  clusterId: string
  canonicalTitle: string
  eventSummary: string
  articles: SearchResult[]
  biasProfiles: Record<string, ArticleBiasProfile>
  sourceDiversity: number  // 0-1, higher = more sources
  regionalCoverage: Record<string, number>
  headlineVariations: string[]
  framingComparison: string
}

/**
 * Response from the story-clusters API.
 */
export interface StoryClusterResponse {
  clusters: StoryCluster[]
  totalArticlesAnalyzed: number
  queryArticleId: string | null
}

/**
 * Request parameters for finding story clusters.
 */
export interface StoryClusterRequest {
  articleId?: string
  text?: string
  topK?: number
  similarityThreshold?: number
  includeBiasAnalysis?: boolean
}
