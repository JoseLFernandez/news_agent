import type { ArticleSource } from '../types/article'

const VALID_SOURCES: ArticleSource[] = [
  'medium',
  'gdelt',
  'perplexity',
  'finance',
  'ft',
  'myft',
]

export function toArticleSource(value: unknown): ArticleSource {
  if (typeof value === 'string' && VALID_SOURCES.includes(value as ArticleSource)) {
    return value as ArticleSource
  }
  return 'medium'
}
