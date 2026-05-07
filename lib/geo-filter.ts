import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import type { CafeMarker } from '@/types'
import { TAIPEI_DISTRICT_FEATURES } from './districts'

export function filterByDistrict(cafes: CafeMarker[], districtName: string): CafeMarker[] {
  const feature = TAIPEI_DISTRICT_FEATURES[districtName]
  if (!feature) return cafes
  return cafes.filter(cafe => booleanPointInPolygon(point([cafe.lng, cafe.lat]), feature))
}
