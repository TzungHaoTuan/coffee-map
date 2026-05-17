import type { CafeMarker, SidebarView } from '@/types'
import DistrictPrompt from './DistrictPrompt'
import CafeList from './CafeList'
import CafeDetail from './CafeDetail'

interface SidebarProps {
  view: SidebarView
  district: string | null
  cafes: CafeMarker[]
  selectedCafe: CafeMarker | null
  isLoading: boolean
  hasPrev: boolean
  hasNext: boolean
  onCafeClick: (cafe: CafeMarker) => void
  onBack: () => void
  onNextPage: () => void
  onPrevPage: () => void
}

export default function Sidebar({ view, district, cafes, selectedCafe, isLoading, hasPrev, hasNext, onCafeClick, onBack, onNextPage, onPrevPage }: SidebarProps) {
  return (
    <aside className="w-80 h-full flex flex-col border-l border-zinc-200 bg-white overflow-hidden shrink-0">
      {view === 'prompt' && <DistrictPrompt />}
      {view === 'list' && (
        <CafeList district={district} cafes={cafes} isLoading={isLoading} hasPrev={hasPrev} hasNext={hasNext} onCafeClick={onCafeClick} onNextPage={onNextPage} onPrevPage={onPrevPage} />
      )}
      {view === 'detail' && selectedCafe && (
        <CafeDetail cafe={selectedCafe} onBack={onBack} />
      )}
    </aside>
  )
}
