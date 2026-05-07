'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { CafeMarker, SidebarView } from '@/types'
import { getMockCafes } from '@/lib/mock-data'
import Sidebar from '@/components/sidebar/Sidebar'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <div className="flex-1 bg-zinc-100 animate-pulse" />,
})

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [cafes, setCafes] = useState<CafeMarker[]>([])
  const [sidebarView, setSidebarView] = useState<SidebarView>('prompt')
  const [selectedCafe, setSelectedCafe] = useState<CafeMarker | null>(null)

  function handleDistrictClick(districtName: string) {
    setSelectedDistrict(districtName)
    setCafes(getMockCafes(districtName))
    setSidebarView('list')
    setSelectedCafe(null)
  }

  function handleCafeClick(cafe: CafeMarker) {
    setSelectedCafe(cafe)
    setSidebarView('detail')
  }

  function handleBackToList() {
    setSidebarView('list')
    setSelectedCafe(null)
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex-1 relative">
        <MapView
          selectedDistrict={selectedDistrict}
          cafes={cafes}
          onDistrictClick={handleDistrictClick}
          onCafeClick={handleCafeClick}
        />
      </div>
      <Sidebar
        view={sidebarView}
        district={selectedDistrict}
        cafes={cafes}
        selectedCafe={selectedCafe}
        onCafeClick={handleCafeClick}
        onBack={handleBackToList}
      />
    </main>
  )
}
