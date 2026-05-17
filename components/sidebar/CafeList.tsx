import type { CafeMarker } from '@/types'
import CafeCard from './CafeCard'

interface CafeListProps {
  district: string | null
  cafes: CafeMarker[]
  isLoading: boolean
  hasPrev: boolean
  hasNext: boolean
  onCafeClick: (cafe: CafeMarker) => void
  onNextPage: () => void
  onPrevPage: () => void
}

export default function CafeList({ district, cafes, isLoading, hasPrev, hasNext, onCafeClick, onNextPage, onPrevPage }: CafeListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-800">{district}</h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          {isLoading ? '搜尋中…' : `${cafes.length} 間咖啡廳`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-sm text-zinc-400">
            載入中…
          </div>
        ) : (
          cafes.map(cafe => (
            <CafeCard key={cafe.placeId} cafe={cafe} onClick={() => onCafeClick(cafe)} />
          ))
        )}
      </div>

      {(hasPrev || hasNext) && !isLoading && (
        <div className="px-4 py-3 border-t border-zinc-100 flex items-center justify-between shrink-0">
          {hasPrev ? (
            <button
              onClick={onPrevPage}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              上一頁
            </button>
          ) : <div />}
          {hasNext && (
            <button
              onClick={onNextPage}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              下一頁
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
