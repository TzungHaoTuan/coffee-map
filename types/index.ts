export type District = {
  name: string
  center: [number, number]
  radius: number
}

export type CafeMarker = {
  placeId: string
  name: string
  lat: number
  lng: number
  rating?: number
  userRatingsTotal?: number
  vicinity?: string
  checkinStatus?: 'visited' | 'wishlist' | null
}

export type CafeDetails = {
  placeId: string
  name: string
  formattedAddress: string
  internationalPhoneNumber?: string
  openingHours?: {
    weekdayDescriptions: string[]
    openNow: boolean
  }
  rating?: number
  photos: Array<{ photoName: string; widthPx: number; heightPx: number }>
  websiteUri?: string
}

export type SidebarView = 'prompt' | 'list' | 'detail'

export type CheckinStatus = 'visited' | 'wishlist'
