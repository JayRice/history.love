import { GeoLocation } from '@/src/types/GeoLocation';

type FetchOpts = {
  limit?: number;               // default 8
  countryCodes?: string[];      // e.g. ["us","ca"]
  language?: string;            // e.g. "en"
};
import Constants from "expo-constants";


export const fetchLocations = async (
  query: string,
  opts: FetchOpts = {}
): Promise<GeoLocation[]> => {
  if (!query?.trim()) return [];

  const {
    limit = 8,
    countryCodes,
    language,
  } = opts;

  const KEY =  Constants.expoConfig?.extra?.locationIQKey;
  if (!KEY) {
    console.warn("LocationIQ key missing. Set EXPO_PUBLIC_LOCATIONIQ_KEY or NEXT_PUBLIC_LOCATIONIQ_KEY.");
    return [];
  }

  const params = new URLSearchParams({
    key: KEY,
    q: query.trim(),
    limit: String(limit),
    // Normalize place labels like cities/towns to a consistent "city" field
    normalizecity: "1",
    addressdetails: "1",
  });

  if (countryCodes?.length) params.set("countrycodes", countryCodes.join(","));
  if (language) params.set("accept-language", language);

  const url = `https://us1.locationiq.com/v1/autocomplete?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (e) {
    console.error("LocationIQ fetch failed:", e);
    return [];
  }

  // Be nice on rate limits
  if (res.status === 429) {
    console.warn("LocationIQ rate limit hit (429). Back off before retrying.");
    return [];
  }

  if (!res.ok) {
    console.warn("LocationIQ error:", res.status, await safeText(res));
    return [];
  }

  const json: any[] = await res.json();

  return json.map((item) => {
    const addr = item.address ?? {};
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.municipality ||
      null;

    const state = addr.state || addr.region || addr.county || null;

    const country = addr.country || null;
    const countryCode = (addr.country_code
      ? String(addr.country_code).toUpperCase()
      : null) as string | null;

    const pieces = [city, state, countryCode || country].filter(Boolean);
    const label = pieces.join(", ") || item.display_name || query;

    return {
      id: String(item.place_id ?? item.osm_id ?? label),
      label,
      latitude: item.lat ? Number(item.lat) : undefined,
      longitude: item.lon ? Number(item.lon) : undefined,
      city,
      state,
      country,
      countryCode,
    } as GeoLocation;
  });
};

async function safeText(res: Response) {
  try { return await res.text(); } catch { return ""; }
}