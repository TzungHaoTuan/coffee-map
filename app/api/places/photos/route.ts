import type { NextRequest } from 'next/server'
import { buildPhotoMediaUrl } from '@/lib/google-places'

export async function GET(request: NextRequest) {
  const photoName = request.nextUrl.searchParams.get('photo_name')
  const maxWidth = Number(request.nextUrl.searchParams.get('max_width') ?? '800')

  if (!photoName) {
    return new Response('photo_name is required', { status: 400 })
  }

  if (!photoName.startsWith('places/')) {
    return new Response('invalid photo_name', { status: 400 })
  }

  let mediaUrl: string
  try {
    mediaUrl = buildPhotoMediaUrl(photoName, maxWidth)
  } catch {
    return new Response('server configuration error', { status: 500 })
  }

  const upstream = await fetch(mediaUrl)

  if (!upstream.ok) {
    return new Response('photo fetch failed', { status: 502 })
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'

  return new Response(upstream.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
