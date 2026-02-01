/**
 * Extract the first image URL from HTML content
 * Handles various image sources: <img> tags, Medium CDN, figure elements
 */
export function extractFirstImage(htmlContent: string | undefined): string | null {
  if (!htmlContent) return null

  // Try Medium CDN image first (most reliable for Medium content)
  const mediumCdnMatch = htmlContent.match(
    /https:\/\/cdn-images-\d+\.medium\.com\/[^\s"'<>)]+/
  )
  if (mediumCdnMatch) {
    return mediumCdnMatch[0]
  }

  // Try standard <img> tag
  const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1]
  }

  // Try figure element with img inside
  const figureMatch = htmlContent.match(
    /<figure[^>]*>.*?<img[^>]+src=["']([^"']+)["']/is
  )
  if (figureMatch && figureMatch[1]) {
    return figureMatch[1]
  }

  // Try background-image in style
  const bgMatch = htmlContent.match(
    /background-image:\s*url\(["']?([^"')]+)["']?\)/i
  )
  if (bgMatch && bgMatch[1]) {
    return bgMatch[1]
  }

  return null
}

/**
 * Generate a placeholder gradient based on title hash
 */
export function generatePlaceholder(title: string): string {
  const hash = title.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)

  const hue = Math.abs(hash) % 360
  const saturation = 30 + (Math.abs(hash >> 8) % 20)
  const lightness = 85 + (Math.abs(hash >> 16) % 10)

  return `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness - 10}%))`
}

/**
 * Extract summary from HTML content
 */
export function extractSummary(htmlContent: string | undefined, maxLength = 200): string {
  if (!htmlContent) return ''

  // Strip HTML tags
  const text = htmlContent
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text

  // Truncate at word boundary
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return lastSpace > maxLength * 0.7
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...'
}

/**
 * Estimate read time based on word count
 */
export function estimateReadTime(htmlContent: string | undefined): number {
  if (!htmlContent) return 1

  const text = htmlContent.replace(/<[^>]+>/g, ' ')
  const wordCount = text.split(/\s+/).filter(Boolean).length

  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200))
}
