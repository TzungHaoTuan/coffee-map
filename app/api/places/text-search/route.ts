import type { NextRequest } from "next/server";
import type { CafeMarker } from "@/types";
import { TAIPEI_DISTRICTS } from "@/lib/districts";
import { filterByDistrict } from "@/lib/geo-filter";

interface PlacesPlace {
  id: string;
  displayName: { text: string };
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  shortFormattedAddress?: string;
}

interface PlacesResponse {
  places?: PlacesPlace[];
  nextPageToken?: string;
}

function toMarker(p: PlacesPlace): CafeMarker {
  return {
    placeId: p.id,
    name: p.displayName.text,
    lat: p.location.latitude,
    lng: p.location.longitude,
    rating: p.rating,
    userRatingsTotal: p.userRatingCount,
    vicinity: p.shortFormattedAddress,
  };
}

export async function GET(request: NextRequest) {
  const districtName = request.nextUrl.searchParams.get("district");
  const query = request.nextUrl.searchParams.get("query") ?? "手沖 咖啡";
  const pageToken = request.nextUrl.searchParams.get("page_token") ?? undefined;

  if (!districtName) {
    return Response.json({ error: "district is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GOOGLE_PLACES_API_KEY not configured" },
      { status: 500 },
    );
  }

  const district = TAIPEI_DISTRICTS.find((d) => d.name === districtName);
  if (!district) {
    return Response.json(
      { error: `Unknown district: ${districtName}` },
      { status: 400 },
    );
  }

  const [lng, lat] = district.center;

  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 20,
    locationBias: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: district.radius,
      },
    },
  };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.shortFormattedAddress,nextPageToken",
      },
      body: JSON.stringify(body),
      next: { revalidate: 86400 },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return Response.json(
      { error: `Google Places API error: ${text}` },
      { status: 502 },
    );
  }

  const data: PlacesResponse = await res.json();
  const raw = (data.places ?? []).map(toMarker);
  const cafes = filterByDistrict(raw, districtName);

  return Response.json({ cafes, nextPageToken: data.nextPageToken });
}
