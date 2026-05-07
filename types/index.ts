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
  formattedPhoneNumber?: string
  openingHours?: {
    weekdayText: string[]
    openNow: boolean
  }
  rating?: number
  photos: Array<{ photoReference: string; width: number; height: number }>
  website?: string
}

export type SidebarView = 'prompt' | 'list' | 'detail'

export type CheckinStatus = 'visited' | 'wishlist'
