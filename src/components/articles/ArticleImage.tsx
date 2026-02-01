import { useState } from 'react'
import { generatePlaceholder } from '../../utils/imageExtractor'
import clsx from 'clsx'

interface ArticleImageProps {
  src?: string
  alt: string
  className?: string
  aspectRatio?: 'video' | 'square' | 'wide'
}

export default function ArticleImage({
  src,
  alt,
  className,
  aspectRatio = 'video',
}: ArticleImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const placeholder = generatePlaceholder(alt)

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[2/1]',
  }

  if (!src || error) {
    return (
      <div
        className={clsx(
          'relative overflow-hidden bg-gray-100',
          aspectClasses[aspectRatio],
          className
        )}
        style={{ background: placeholder }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-serif font-bold text-white/50">
            {alt.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-gray-100',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {!loaded && (
        <div
          className="absolute inset-0"
          style={{ background: placeholder }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        className={clsx(
          'w-full h-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}
