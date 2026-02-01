export interface FeedSource {
  id: string
  name: string
  url: string
  topics: string[]
}

export const MEDIUM_FEEDS: FeedSource[] = [
  {
    id: 'medium-tech',
    name: 'Medium - Technology',
    url: 'https://medium.com/feed/tag/technology',
    topics: ['technology'],
  },
  {
    id: 'medium-programming',
    name: 'Medium - Programming',
    url: 'https://medium.com/feed/tag/programming',
    topics: ['programming'],
  },
  {
    id: 'medium-ai',
    name: 'Medium - AI',
    url: 'https://medium.com/feed/tag/artificial-intelligence',
    topics: ['ai'],
  },
  {
    id: 'medium-science',
    name: 'Medium - Science',
    url: 'https://medium.com/feed/tag/science',
    topics: ['science'],
  },
  {
    id: 'medium-business',
    name: 'Medium - Business',
    url: 'https://medium.com/feed/tag/business',
    topics: ['business'],
  },
  {
    id: 'medium-design',
    name: 'Medium - Design',
    url: 'https://medium.com/feed/tag/design',
    topics: ['design'],
  },
  {
    id: 'medium-productivity',
    name: 'Medium - Productivity',
    url: 'https://medium.com/feed/tag/productivity',
    topics: ['productivity'],
  },
  {
    id: 'medium-startups',
    name: 'Medium - Startups',
    url: 'https://medium.com/feed/tag/startup',
    topics: ['startups'],
  },
  {
    id: 'medium-finance',
    name: 'Medium - Finance',
    url: 'https://medium.com/feed/tag/finance',
    topics: ['finance'],
  },
  {
    id: 'medium-investing',
    name: 'Medium - Investing',
    url: 'https://medium.com/feed/tag/investing',
    topics: ['finance'],
  },
  {
    id: 'medium-fintech',
    name: 'Medium - Fintech',
    url: 'https://medium.com/feed/tag/fintech',
    topics: ['finance', 'technology'],
  },
]

export function getFeedsForTopics(topics: string[]): FeedSource[] {
  if (topics.length === 0) return MEDIUM_FEEDS
  return MEDIUM_FEEDS.filter(feed =>
    feed.topics.some(t => topics.includes(t))
  )
}
