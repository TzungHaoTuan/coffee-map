import type { CafeMarker } from '@/types'
import CafeCard from './CafeCard'

interface CafeListProps {
  district: string | null
  cafes: CafeMarker[]
  onCafeClick: (cafe: CafeMarker) => void
}

export default function CafeList({ district, cafes, onCafeClick }: CafeListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-800">{district}</h2>
        <p className="text-xs text-zinc-400 mt-0.5">{cafes.length} 間咖啡廳</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {cafes.map(cafe => (
          <CafeCard key={cafe.placeId} cafe={cafe} onClick={() => onCafeClick(cafe)} />
        ))}
      </div>
    </div>
  )
}
