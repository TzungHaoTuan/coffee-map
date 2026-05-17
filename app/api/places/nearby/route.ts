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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const districtName = searchParams.get("district");
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 20);

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

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.shortFormattedAddress",
      },
      body: JSON.stringify({
        includedTypes: ["coffee_shop", "coffee_stand", "cafe"],
        maxResultCount: limit,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: district.radius,
          },
        },
      }),
      next: { revalidate: 86400 }, // 24h server-side cache per district
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
  console.log("rawdata", data);

  const raw: CafeMarker[] = (data.places ?? []).map((p) => ({
    placeId: p.id,
    name: p.displayName.text,
    lat: p.location.latitude,
    lng: p.location.longitude,
    rating: p.rating,
    userRatingsTotal: p.userRatingCount,
    vicinity: p.shortFormattedAddress,
  }));

  const cafes = filterByDistrict(raw, districtName);

  return Response.json(cafes);
}
