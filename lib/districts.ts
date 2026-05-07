import type { Feature, Polygon, MultiPolygon } from 'geojson'
import geojson from './taipei-districts.json'

type Coord = [number, number]
type Ring = Coord[]

function ringCentroid(ring: Ring): Coord {
  const n = ring.length - 1  // GeoJSON rings close on themselves
  let lngSum = 0, latSum = 0
  for (let i = 0; i < n; i++) {
    lngSum += ring[i][0]
    latSum += ring[i][1]
  }
  return [lngSum / n, latSum / n]
}

function metersFrom(a: Coord, b: Coord): number {
  const dLng = (b[0] - a[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180)
  const dLat = (b[1] - a[1]) * 110540
  return Math.sqrt(dLng * dLng + dLat * dLat)
}

export type TaipeiFeature = Feature<Polygon | MultiPolygon, { TOWNNAME: string }>

export const TAIPEI_DISTRICTS = (geojson.features as TaipeiFeature[]).map(f => {
  const { geometry, properties } = f
  const outerRing: Ring =
    geometry.type === 'MultiPolygon'
      ? geometry.coordinates.reduce((a, b) => (a[0].length >= b[0].length ? a : b))[0] as Ring
      : geometry.coordinates[0] as Ring

  const center = ringCentroid(outerRing)
  const radius = outerRing.reduce((max, pt) => Math.max(max, metersFrom(center, pt as Coord)), 0)

  return { name: properties.TOWNNAME, center, radius }
})

export const TAIPEI_DISTRICT_FEATURES: Record<string, TaipeiFeature> = Object.fromEntries(
  (geojson.features as TaipeiFeature[]).map(f => [f.properties.TOWNNAME, f])
)
