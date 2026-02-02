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
  {
    id: 'medium-leadership',
    name: 'Medium - Leadership',
    url: 'https://medium.com/feed/tag/leadership',
    topics: ['leadership'],
  },
  {
    id: 'medium-management',
    name: 'Medium - Management',
    url: 'https://medium.com/feed/tag/management',
    topics: ['leadership'],
  },
  {
    id: 'medium-ceo',
    name: 'Medium - CEO',
    url: 'https://medium.com/feed/tag/ceo',
    topics: ['leadership', 'business'],
  },
  // Cybersecurity feeds
  {
    id: 'medium-cybersecurity',
    name: 'Medium - Cybersecurity',
    url: 'https://medium.com/feed/tag/cybersecurity',
    topics: ['cybersecurity'],
  },
  {
    id: 'medium-infosec',
    name: 'Medium - InfoSec',
    url: 'https://medium.com/feed/tag/infosec',
    topics: ['cybersecurity'],
  },
  {
    id: 'medium-security',
    name: 'Medium - Security',
    url: 'https://medium.com/feed/tag/security',
    topics: ['cybersecurity'],
  },
  // Hacking feeds
  {
    id: 'medium-hacking',
    name: 'Medium - Hacking',
    url: 'https://medium.com/feed/tag/hacking',
    topics: ['hacking'],
  },
  {
    id: 'medium-ethical-hacking',
    name: 'Medium - Ethical Hacking',
    url: 'https://medium.com/feed/tag/ethical-hacking',
    topics: ['hacking', 'cybersecurity'],
  },
  {
    id: 'medium-pentesting',
    name: 'Medium - Pentesting',
    url: 'https://medium.com/feed/tag/penetration-testing',
    topics: ['hacking', 'cybersecurity'],
  },
  {
    id: 'medium-bugbounty',
    name: 'Medium - Bug Bounty',
    url: 'https://medium.com/feed/tag/bug-bounty',
    topics: ['hacking', 'cybersecurity'],
  },
  // Cracking feeds
  {
    id: 'medium-reverse-engineering',
    name: 'Medium - Reverse Engineering',
    url: 'https://medium.com/feed/tag/reverse-engineering',
    topics: ['cracking', 'hacking', 'cybersecurity'],
  },
  {
    id: 'medium-malware',
    name: 'Medium - Malware Analysis',
    url: 'https://medium.com/feed/tag/malware-analysis',
    topics: ['cracking', 'cybersecurity'],
  },
  {
    id: 'medium-exploit-development',
    name: 'Medium - Exploit Development',
    url: 'https://medium.com/feed/tag/exploit-development',
    topics: ['cracking', 'hacking', 'cybersecurity'],
  },
  // Dark Web feeds
  {
    id: 'medium-darkweb',
    name: 'Medium - Dark Web',
    url: 'https://medium.com/feed/tag/dark-web',
    topics: ['darkweb'],
  },
  {
    id: 'medium-tor',
    name: 'Medium - Tor',
    url: 'https://medium.com/feed/tag/tor',
    topics: ['darkweb', 'cybersecurity'],
  },
  {
    id: 'medium-privacy',
    name: 'Medium - Privacy',
    url: 'https://medium.com/feed/tag/privacy',
    topics: ['darkweb', 'cybersecurity'],
  },
]

export function getFeedsForTopics(topics: string[]): FeedSource[] {
  if (topics.length === 0) return MEDIUM_FEEDS
  return MEDIUM_FEEDS.filter(feed =>
    feed.topics.some(t => topics.includes(t))
  )
}
