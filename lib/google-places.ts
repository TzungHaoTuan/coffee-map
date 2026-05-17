import type { CafeDetails } from '@/types'

const PLACES_BASE = 'https://places.googleapis.com/v1'

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'internationalPhoneNumber',
  'regularOpeningHours',
  'rating',
  'photos',
  'websiteUri',
].join(',')

interface GooglePhoto {
  name: string
  widthPx: number
  heightPx: number
}

interface GooglePlaceDetail {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  internationalPhoneNumber?: string
  regularOpeningHours?: {
    openNow?: boolean
    weekdayDescriptions?: string[]
  }
  rating?: number
  photos?: GooglePhoto[]
  websiteUri?: string
}

export async function fetchPlaceDetails(placeId: string): Promise<CafeDetails> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured')

  const res = await fetch(`${PLACES_BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': DETAIL_FIELD_MASK,
    },
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google Places Details API error: ${text}`)
  }

  const data: GooglePlaceDetail = await res.json()

  return {
    placeId: data.id,
    name: data.displayName?.text ?? '',
    formattedAddress: data.formattedAddress ?? '',
    internationalPhoneNumber: data.internationalPhoneNumber,
    openingHours: data.regularOpeningHours
      ? {
          weekdayDescriptions: data.regularOpeningHours.weekdayDescriptions ?? [],
          openNow: data.regularOpeningHours.openNow ?? false,
        }
      : undefined,
    rating: data.rating,
    photos: (data.photos ?? []).map((p) => ({
      photoName: p.name,
      widthPx: p.widthPx,
      heightPx: p.heightPx,
    })),
    websiteUri: data.websiteUri,
  }
}

export function buildPhotoMediaUrl(photoName: string, maxWidthPx: number): string {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not configured')
  return `${PLACES_BASE}/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${encodeURIComponent(apiKey)}`
}
