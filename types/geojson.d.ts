import type { FeatureCollection } from 'geojson'

declare module '*/taipei-districts.json' {
  const value: FeatureCollection
  export default value
}
