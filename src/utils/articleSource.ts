import type { ArticleSource } from '../types/article'

const VALID_SOURCES: ArticleSource[] = [
  'medium',
  'gdelt',
  'perplexity',
  'finance',
  'ft',
  'myft',
]

const SOURCE_ALIASES: Record<string, ArticleSource> = {
  'financial times': 'ft',
  'ft.com': 'ft',
  'www.ft.com': 'ft',
  'ft': 'ft',
  'myft': 'myft',
  'gdelt': 'gdelt',
  'medium': 'medium',
  'perplexity': 'perplexity',
  'finance': 'finance',
}

export function toArticleSource(value: unknown): ArticleSource {
  if (typeof value !== 'string') {
    return 'medium'
  }

  const raw = value.trim()
  if (!raw) {
    return 'medium'
  }

  const normalized = raw.toLowerCase()
  const mapped = SOURCE_ALIASES[normalized]
  if (mapped) {
    return mapped
  }

  if (VALID_SOURCES.includes(normalized as ArticleSource)) {
    return normalized as ArticleSource
  }

  return raw as ArticleSource
}
