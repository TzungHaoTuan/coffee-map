import type { NextRequest } from 'next/server'
import { fetchPlaceDetails } from '@/lib/google-places'

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get('place_id')

  if (!placeId) {
    return Response.json({ error: 'place_id is required' }, { status: 400 })
  }

  try {
    const details = await fetchPlaceDetails(placeId)
    return Response.json(details)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 502 })
  }
}
