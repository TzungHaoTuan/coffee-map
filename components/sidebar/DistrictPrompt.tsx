export default function DistrictPrompt() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      </div>
      <h2 className="text-sm font-medium text-zinc-800">選擇一個行政區</h2>
      <p className="text-xs text-zinc-400 leading-relaxed">點擊地圖上的行政區，探索附近的精品咖啡廳</p>
    </div>
  )
}
