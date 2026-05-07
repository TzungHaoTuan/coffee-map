import type { CafeMarker } from '@/types'

interface CafeDetailProps {
  cafe: CafeMarker
  onBack: () => void
}

export default function CafeDetail({ cafe, onBack }: CafeDetailProps) {
  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 p-4 overflow-y-auto">
        {cafe.vicinity && (
          <p className="text-xs text-zinc-500 mb-4 flex items-start gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {cafe.vicinity}
          </p>
        )}

        {cafe.rating != null && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-semibold text-zinc-800">{cafe.rating}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(cafe.rating!) ? '#f59e0b' : '#e5e7eb'}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            {cafe.userRatingsTotal != null && (
              <span className="text-xs text-zinc-400">({cafe.userRatingsTotal.toLocaleString()})</span>
            )}
          </div>
        )}

        <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-400 text-center leading-relaxed">
          詳細資訊（照片、營業時間、電話）將在 Step 3 串接 Google Places API 後顯示
        </div>
      </div>
    </div>
  )
}
