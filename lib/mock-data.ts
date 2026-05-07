import type { CafeMarker } from '@/types'
import { TAIPEI_DISTRICTS } from './districts'

const PRESET_CAFES: Record<string, CafeMarker[]> = {
  '大安區': [
    { placeId: 'mock_da1', name: 'Simple Kaffa', lat: 25.0285, lng: 121.5430, rating: 4.8, userRatingsTotal: 2341, vicinity: '仁愛路四段300號' },
    { placeId: 'mock_da2', name: 'Rufous Coffee', lat: 25.0320, lng: 121.5451, rating: 4.7, userRatingsTotal: 1823, vicinity: '大安路一段75號' },
    { placeId: 'mock_da3', name: 'Fika Fika Cafe', lat: 25.0431, lng: 121.5482, rating: 4.6, userRatingsTotal: 1567, vicinity: '伊通街33號' },
    { placeId: 'mock_da4', name: 'Coffee Sweet', lat: 25.0265, lng: 121.5398, rating: 4.5, userRatingsTotal: 987, vicinity: '信義路四段135號' },
    { placeId: 'mock_da5', name: 'Gabee.', lat: 25.0419, lng: 121.5440, rating: 4.6, userRatingsTotal: 1234, vicinity: '林森北路546號' },
  ],
  '中山區': [
    { placeId: 'mock_zs1', name: 'Café de Gear', lat: 25.0631, lng: 121.5328, rating: 4.7, userRatingsTotal: 1890, vicinity: '中山北路二段20巷1號' },
    { placeId: 'mock_zs2', name: 'Woolloomooloo', lat: 25.0587, lng: 121.5301, rating: 4.5, userRatingsTotal: 1203, vicinity: '農安街22號' },
    { placeId: 'mock_zs3', name: 'Ounce Taipei', lat: 25.0612, lng: 121.5356, rating: 4.4, userRatingsTotal: 892, vicinity: '南京東路一段30號' },
    { placeId: 'mock_zs4', name: 'Starbucks Reserve', lat: 25.0645, lng: 121.5289, rating: 4.3, userRatingsTotal: 2108, vicinity: '中山北路二段1號' },
  ],
  '信義區': [
    { placeId: 'mock_xy1', name: 'Artista Perfetto', lat: 25.0329, lng: 121.5651, rating: 4.7, userRatingsTotal: 1456, vicinity: '菸廠路88號' },
    { placeId: 'mock_xy2', name: 'Corner Coffee', lat: 25.0368, lng: 121.5628, rating: 4.5, userRatingsTotal: 876, vicinity: '基隆路一段432號' },
    { placeId: 'mock_xy3', name: 'W Cafe', lat: 25.0401, lng: 121.5691, rating: 4.4, userRatingsTotal: 1123, vicinity: '忠孝東路五段100號' },
    { placeId: 'mock_xy4', name: '湛盧咖啡', lat: 25.0355, lng: 121.5670, rating: 4.5, userRatingsTotal: 1678, vicinity: '松仁路100號' },
  ],
  '松山區': [
    { placeId: 'mock_ss1', name: 'Thomas Cafe', lat: 25.0581, lng: 121.5678, rating: 4.6, userRatingsTotal: 1102, vicinity: '八德路四段2號' },
    { placeId: 'mock_ss2', name: 'Lobby of Simple Kaffa', lat: 25.0523, lng: 121.5701, rating: 4.8, userRatingsTotal: 2567, vicinity: '民生東路五段36號' },
    { placeId: 'mock_ss3', name: 'Coffee Stopover', lat: 25.0601, lng: 121.5612, rating: 4.4, userRatingsTotal: 734, vicinity: '南京東路四段133號' },
  ],
}

const CAFE_NAMES = ['晨光咖啡', '巷弄咖啡', '老樹咖啡', '山丘咖啡', '日光咖啡', '微醺咖啡', '城市日常', '好日子咖啡', '慢時光', '第一杯']

function generateMockCafes(districtName: string): CafeMarker[] {
  const district = TAIPEI_DISTRICTS.find(d => d.name === districtName)
  if (!district) return []

  const [lng, lat] = district.center
  const spread = (district.radius / 111000) * 0.8

  return CAFE_NAMES.slice(0, 5).map((name, i) => {
    const seed = i * 7919
    const pseudoRandLat = ((seed * 1234567) % 1000) / 1000 - 0.5
    const pseudoRandLng = ((seed * 9876543) % 1000) / 1000 - 0.5
    return {
      placeId: `mock_${districtName}_${i}`,
      name,
      lat: lat + pseudoRandLat * spread * 2,
      lng: lng + pseudoRandLng * spread * 2,
      rating: +((3.8 + (seed % 12) / 10)).toFixed(1),
      userRatingsTotal: 100 + (seed % 900),
      vicinity: `${districtName}某路某段${(seed % 200) + 1}號`,
    }
  })
}

export function getMockCafes(districtName: string): CafeMarker[] {
  return PRESET_CAFES[districtName] ?? generateMockCafes(districtName)
}
