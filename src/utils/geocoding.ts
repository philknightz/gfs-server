import config from "../constant/config";
import logger from "./logger";
import { client } from "../libs/map";
import { Language } from "@googlemaps/google-maps-services-js";

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const apiKey = config.google.mapsApiKey;
  if (!apiKey) return `${latitude},${longitude}`;

  try {
    const resp = await client.reverseGeocode({
      params: {
        latlng: { lat: latitude, lng: longitude },
        key: apiKey,
        language: Language.en,
      },
    });

    const results = resp?.data?.results;
    if (Array.isArray(results) && results.length > 0) {
      return results[0]?.formatted_address || `${latitude},${longitude}`;
    }
    return `${latitude},${longitude}`;
  } catch (error) {
    logger.error(`reverseGeocode error: ${error}`);
    return `${latitude},${longitude}`;
  }
}

export type NearbyPlace = {
  placeId: string;
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  address?: string;
  location: { lat: number; lng: number };
  types?: string[];
  openNow?: boolean;
};

export type GooglePlaceResult = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  types?: string[];
  opening_hours?: { open_now?: boolean };
  price_level?: number | null;
  address?: string;
  open_now?: boolean | null;
  photo_reference?: string | null;
};

export async function findNearbyPlaces(
  latitude: number,
  longitude: number,
  type: string[],
  radiusMeters = 10000,
  language: Language = Language.vi
): Promise<Record<string, GooglePlaceResult[]>> {
  const apiKey = config.google.mapsApiKey;
  if (!apiKey) return {};

  try {
    const placeByTypes = await Promise.all(
      type.map(async (t) =>
        client.placesNearby({
          params: {
            key: apiKey,
            location: { lat: latitude, lng: longitude },
            radius: radiusMeters,
            keyword: t,
            language,
            opennow: true,
          },
        })
      )
    );

    const mapped: Record<string, GooglePlaceResult[]> = {};
    type.forEach((t, idx) => {
      const rs = placeByTypes[idx]?.data?.results.map((r) => ({
        place_id: r.place_id,
        name: r.name,
        types: r.types ?? [],
        location: r.geometry?.location ?? null,
        rating: r.rating ?? null,
        user_ratings_total: r.user_ratings_total ?? 0,
        price_level: r.price_level ?? null,
        address: r.formatted_address ?? r.vicinity ?? "",
        open_now: r.opening_hours?.open_now ?? null,
        photo_reference: r.photos?.[0]?.photo_reference ?? null,
      }));
      const results = (rs ?? []) as GooglePlaceResult[];
      mapped[t] = results;
    });

    return mapped;
  } catch (error) {
    logger.error(`findNearbyPlaces error: ${error}`);
    return {};
  }
}

export async function getPlacePhotoUrl(placeId: string): Promise<{ photos?: string[]; reviews?: any[] }> {
  const apiKey = config.google.mapsApiKey;
  if (!apiKey || !placeId) return {};
  try {
    const details = await client.placeDetails({
      params: {
        key: apiKey,
        place_id: placeId,
        language: Language.vi,
      },
    });

    return {
      ...details?.data?.result,
      photos: details?.data?.result?.photos?.map(
        (p) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${p.photo_reference}&key=${apiKey}`
      ),
    };
  } catch (error) {
    logger.error(`getPlacePhotoUrl error: ${error}`);
    return {};
  }
}
