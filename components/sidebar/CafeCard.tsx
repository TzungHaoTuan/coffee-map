import type { CafeMarker } from '@/types'

interface CafeCardProps {
  cafe: CafeMarker
  onClick: () => void
}

export default function CafeCard({ cafe, onClick }: CafeCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 truncate">{cafe.name}</p>
          {cafe.vicinity && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">{cafe.vicinity}</p>
          )}
        </div>
        {cafe.rating != null && (
          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
            <span className="text-xs font-medium text-zinc-600">{cafe.rating}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" className="mb-px">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        )}
      </div>
    </button>
  )
}
