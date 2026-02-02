export type TrendingCategory =
  | 'technology'
  | 'business'
  | 'politics'
  | 'science'
  | 'culture'
  | 'sports'

export interface TrendingTopic {
  title: string
  summary: string
  category: TrendingCategory
  heat: number // 1-10
  articles?: Array<{
    title: string
    originalTitle?: string // Original title before translation
    url: string
    source: string
    date: string
  }>
}

export interface TrendingResponse {
  topics: TrendingTopic[]
  citations: string[]
}

export type RegulationStatus =
  | 'proposed'
  | 'in_committee'
  | 'passed'
  | 'enacted'
  | 'in_effect'

export type RegulationImpact = 'high' | 'medium' | 'low'

export interface Regulation {
  name: string
  status: RegulationStatus
  summary: string
  lastUpdate: string
  impact: RegulationImpact
}

export interface RecentDevelopment {
  title: string
  date?: string
  summary?: string
  url?: string
}

export interface RegulatoryData {
  regulations: Regulation[]
  overallStance: string
  recentDevelopments: RecentDevelopment[] | string[]
}

export interface RegulatoryResponse {
  data: RegulatoryData
  citations: string[]
}

export type RegulatoryTopic = 'ai' | 'privacy' | 'cybersecurity'

// Batch trending types for Europe map
export interface CountryTrendingData {
  topics: TrendingTopic[]
  heat: number // Normalized 0-1
}

export type TrendingBatchResponse = Record<string, CountryTrendingData>

export const REGULATORY_TOPICS: { id: RegulatoryTopic; label: string; icon: string }[] = [
  { id: 'ai', label: 'AI & ML', icon: '🤖' },
  { id: 'privacy', label: 'Data Privacy', icon: '🔒' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🛡️' },
]
