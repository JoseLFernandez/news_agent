export interface Topic {
  id: string
  label: string
  color: string
}

export const TOPICS: Topic[] = [
  { id: 'technology', label: 'Technology', color: '#2563eb' },
  { id: 'programming', label: 'Programming', color: '#7c3aed' },
  { id: 'ai', label: 'Artificial Intelligence', color: '#059669' },
  { id: 'science', label: 'Science', color: '#d97706' },
  { id: 'business', label: 'Business', color: '#dc2626' },
  { id: 'design', label: 'Design', color: '#db2777' },
  { id: 'productivity', label: 'Productivity', color: '#0891b2' },
  { id: 'startups', label: 'Startups', color: '#4f46e5' },
  { id: 'regulatory', label: 'Regulatory', color: '#64748b' },
  { id: 'finance', label: 'Finance & Investment', color: '#16a34a' },
  { id: 'leadership', label: 'Leadership', color: '#f59e0b' },
  { id: 'cybersecurity', label: 'Cybersecurity', color: '#0f766e' },
  { id: 'hacking', label: 'Hacking', color: '#be123c' },
  { id: 'cracking', label: 'Cracking', color: '#9f1239' },
  { id: 'darkweb', label: 'Dark Web', color: '#1e1b4b' },
]

export const TOPIC_MAP = new Map(TOPICS.map(t => [t.id, t]))

export function getTopicColor(topicId: string): string {
  return TOPIC_MAP.get(topicId)?.color ?? '#6b7280'
}

export function getTopicLabel(topicId: string): string {
  return TOPIC_MAP.get(topicId)?.label ?? topicId
}
