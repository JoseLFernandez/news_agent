import { useFilterStore } from '../../stores/filterStore'

const LANGUAGES = [
  { code: 'any', label: 'Any language' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'es', label: 'Spanish' },
  { code: 'it', label: 'Italian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'nl', label: 'Dutch' },
  { code: 'pl', label: 'Polish' },
]

export default function LanguageFilter() {
  const { language, setLanguage } = useFilterStore()

  return (
    <label className="flex items-center gap-2">
      <span className="text-xs text-gray-500">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-700 bg-white"
        aria-label="Language"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}
