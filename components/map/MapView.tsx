'use client'

import { useRef, useState } from 'react'
import Map, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox'
import type { MapRef, MapMouseEvent, MapGeoJSONFeature } from 'react-map-gl/mapbox'
import { TAIPEI_DISTRICTS } from '@/lib/districts'
import taipeiDistricts from '@/lib/taipei-districts.json'
import type { CafeMarker } from '@/types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

type ClickEvent = MapMouseEvent & { features?: MapGeoJSONFeature[] }

interface MapViewProps {
  selectedDistrict: string | null
  cafes: CafeMarker[]
  onDistrictClick: (name: string) => void
  onCafeClick: (cafe: CafeMarker) => void
}

export default function MapView({ selectedDistrict, cafes, onDistrictClick, onCafeClick }: MapViewProps) {
  const mapRef = useRef<MapRef>(null)
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null)

  const handleClick = (e: ClickEvent) => {
    const feature = e.features?.[0]
    if (!feature) return

    if (feature.layer?.id === 'cafe-circles') {
      const placeId = feature.properties?.placeId as string
      const cafe = cafes.find(c => c.placeId === placeId)
      if (cafe) onCafeClick(cafe)
      return
    }

    if (!feature.properties?.TOWNNAME) return
    const name = feature.properties.TOWNNAME as string
    const district = TAIPEI_DISTRICTS.find(d => d.name === name)
    if (district) {
      mapRef.current?.flyTo({ center: district.center, zoom: 14, duration: 1500 })
    }
    onDistrictClick(name)
  }

  const handleMouseMove = (e: ClickEvent) => {
    const name = (e.features?.[0]?.properties?.TOWNNAME as string) ?? null
    setHoveredDistrict(name)
  }

  const cafesGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: cafes.map(cafe => ({
      type: 'Feature',
      properties: { placeId: cafe.placeId, name: cafe.name, rating: cafe.rating ?? null },
      geometry: { type: 'Point', coordinates: [cafe.lng, cafe.lat] },
    })),
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-100">
        <p className="text-sm text-zinc-500">請在 .env.local 設定 NEXT_PUBLIC_MAPBOX_TOKEN</p>
      </div>
    )
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{ longitude: 121.535, latitude: 25.055, zoom: 11 }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      style={{ width: '100%', height: '100%' }}
      interactiveLayerIds={['district-fill', 'cafe-circles']}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      cursor={hoveredDistrict ? 'pointer' : 'default'}
    >
      <NavigationControl position="top-right" />

      <Source id="districts" type="geojson" data={taipeiDistricts as GeoJSON.FeatureCollection}>
        <Layer
          id="district-fill"
          type="fill"
          paint={{
            'fill-color': '#3b82f6',
            'fill-opacity': [
              'case',
              ['==', ['get', 'TOWNNAME'], hoveredDistrict ?? ''],
              0.45,
              selectedDistrict
                ? ['case', ['==', ['get', 'TOWNNAME'], selectedDistrict], 0.35, 0.12]
                : 0.15,
            ],
          }}
        />
        <Layer
          id="district-line"
          type="line"
          paint={{
            'line-color': '#2563eb',
            'line-width': [
              'case',
              ['==', ['get', 'TOWNNAME'], selectedDistrict ?? ''],
              2.5,
              1,
            ],
          }}
        />
        <Layer
          id="district-label"
          type="symbol"
          layout={{
            'text-field': ['get', 'TOWNNAME'],
            'text-font': ['Noto Sans CJK TC Regular', 'Arial Unicode MS Regular'],
            'text-size': 13,
            'text-anchor': 'center',
          }}
          paint={{
            'text-color': '#1e3a5f',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
          }}
        />
      </Source>

      <Source id="cafes" type="geojson" data={cafesGeoJSON}>
        <Layer
          id="cafe-circles"
          type="circle"
          paint={{
            'circle-radius': 6,
            'circle-color': '#6b7280',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          }}
        />
      </Source>
    </Map>
  )
}
