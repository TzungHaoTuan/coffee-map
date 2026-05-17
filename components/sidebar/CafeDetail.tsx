'use client'

import { useQuery } from '@tanstack/react-query'
import type { CafeMarker, CafeDetails } from '@/types'

interface CafeDetailProps {
  cafe: CafeMarker
  onBack: () => void
}

async function fetchCafeDetails(placeId: string): Promise<CafeDetails> {
  const res = await fetch(`/api/places/details?place_id=${encodeURIComponent(placeId)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function CafeDetail({ cafe, onBack }: CafeDetailProps) {
  const { data: details, isLoading, isError } = useQuery({
    queryKey: ['place-details', cafe.placeId],
    queryFn: () => fetchCafeDetails(cafe.placeId),
  })

  const photos = details?.photos.slice(0, 3) ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2 shrink-0">
        <button
          onClick={onBack}
          className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5"
          aria-label="返回清單"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold text-zinc-800 truncate">{cafe.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="p-4 space-y-3 animate-pulse">
            <div className="h-36 w-full bg-zinc-100 rounded" />
            <div className="h-4 w-2/3 bg-zinc-100 rounded" />
            <div className="h-4 w-1/2 bg-zinc-100 rounded" />
            <div className="h-4 w-3/4 bg-zinc-100 rounded" />
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <p className="p-4 text-xs text-red-500">詳細資訊載入失敗</p>
        )}

        {/* Details */}
        {details && !isLoading && (
          <>
            {/* Photo strip */}
            {photos.length > 0 && (
              <div className="flex gap-1 overflow-x-auto p-2 bg-zinc-50 shrink-0">
                {photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.photoName}
                    src={`/api/places/photos?photo_name=${encodeURIComponent(photo.photoName)}&max_width=800`}
                    alt={cafe.name}
                    className="h-36 w-auto rounded object-cover shrink-0"
                  />
                ))}
              </div>
            )}

            <div className="p-4 space-y-4">
              {/* Address */}
              {details.formattedAddress && (
                <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {details.formattedAddress}
                </p>
              )}

              {/* Rating */}
              {details.rating != null && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-zinc-800">{details.rating}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(details.rating!) ? '#f59e0b' : '#e5e7eb'}>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  {cafe.userRatingsTotal != null && (
                    <span className="text-xs text-zinc-400">({cafe.userRatingsTotal.toLocaleString()})</span>
                  )}
                </div>
              )}

              {/* Phone */}
              {details.internationalPhoneNumber && (
                <a
                  href={`tel:${details.internationalPhoneNumber}`}
                  className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
                  </svg>
                  {details.internationalPhoneNumber}
                </a>
              )}

              {/* Website */}
              {details.websiteUri && (
                <a
                  href={details.websiteUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="truncate">{details.websiteUri.replace(/^https?:\/\//, '')}</span>
                </a>
              )}

              {/* Opening hours */}
              {details.openingHours && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-zinc-700">營業時間</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      details.openingHours.openNow
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {details.openingHours.openNow ? '營業中' : '已打烊'}
                    </span>
                  </div>
                  <details className="group">
                    <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-600 list-none flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-open:rotate-90 transition-transform shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      查看全週時段
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {details.openingHours.weekdayDescriptions.map((line) => (
                        <li key={line} className="text-xs text-zinc-500">{line}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
