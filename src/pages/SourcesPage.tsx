import { Link } from 'react-router-dom'

type SourceLink = {
  name: string
  description: string
  url: string
}

const SECURITY_SOURCES: SourceLink[] = [
  {
    name: 'The Hacker News',
    description: 'Leading news source dedicated to promoting awareness for security experts and hackers.',
    url: 'https://thehackernews.com/',
  },
  {
    name: 'Latest Hacking News',
    description: 'Latest hacking news, exploits and vulnerabilities for ethical hackers.',
    url: 'https://latesthackingnews.com/',
  },
  {
    name: 'Google Online Security Blog',
    description: 'News and insights from Google on security and safety on the Internet.',
    url: 'https://security.googleblog.com/',
  },
  {
    name: 'Qualys Blog',
    description: 'Expert network security guidance and news.',
    url: 'https://blog.qualys.com/',
  },
  {
    name: 'DARKReading',
    description: 'Connecting the Information Security Community.',
    url: 'https://www.darkreading.com/',
  },
  {
    name: 'Publicly Disclosed',
    description: 'Public disclosure watcher for recently disclosed bugs.',
    url: 'https://www.publiclydisclosed.com/',
  },
  {
    name: 'Reddit – r/hacking',
    description: 'A subreddit dedicated to hacking and hackers.',
    url: 'https://www.reddit.com/r/hacking/',
  },
  {
    name: 'Packet Storm',
    description: 'InfoSec news, files, tools, exploits, advisories and whitepapers.',
    url: 'https://packetstormsecurity.com/',
  },
  {
    name: 'Sekurak',
    description: 'Security, penetration tests, vulnerabilities (PL/EN).',
    url: 'https://sekurak.pl/',
  },
  {
    name: 'nf.sec',
    description: 'Linux operating system security basics (PL).',
    url: 'https://nfsec.pl/',
  },
]

const OTHER_SOURCES: SourceLink[] = [
  {
    name: 'Changelog',
    description: 'News & podcasts for developers and hackers.',
    url: 'https://changelog.com/',
  },
]

function SourceSection({ title, sources }: { title: string; sources: SourceLink[] }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h2 className="font-serif text-xl font-bold text-ink-900">{title}</h2>
      </div>
      <div className="p-4 space-y-3">
        {sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="block p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold text-ink-900">{s.name}</div>
                <div className="text-sm text-gray-600">{s.description}</div>
              </div>
              <span className="text-xs text-gray-500">Open ↗</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

export default function SourcesPage() {
  return (
    <div className="space-y-6">
      <header className="border-b-2 border-ink-900 pb-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-900">Sources</h1>
          <Link to="/" className="text-sm text-gray-600 hover:text-ink-900 transition-colors">
            Back to Home
          </Link>
        </div>
        <p className="mt-1 text-gray-600">Curated external sources (open in a new tab).</p>
      </header>

      <SourceSection title="Security" sources={SECURITY_SOURCES} />
      <SourceSection title="Other / All-in-one" sources={OTHER_SOURCES} />
    </div>
  )
}
