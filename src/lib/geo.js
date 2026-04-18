const GEO_CACHE_KEY = "pool_room_geo_cache_v1";

export const VENUE_LAT = 55.86540;
export const VENUE_LNG = -4.25322;
export const VENUE_RADIUS_M = 6000;
export const CACHE_TTL_MS = 50 * 1000;

export function getGeoCache() {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;

    const obj = JSON.parse(raw);
    if (!obj?.timestamp) return null;

    if (Date.now() - obj.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }

    return obj;
  } catch {
    return null;
  }
}

export function setGeoCache(payload) {
  localStorage.setItem(
    GEO_CACHE_KEY,
    JSON.stringify({
      ...payload,
      timestamp: Date.now(),
    })
  );
}

export function clearGeoCache() {
  localStorage.removeItem(GEO_CACHE_KEY);
}

export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isInsideVenue(lat, lng) {
  const d = distanceMeters(lat, lng, VENUE_LAT, VENUE_LNG);
  return {
    inside: d <= VENUE_RADIUS_M,
    distanceM: d,
  };
}

export function requestGeolocation(options = {}) {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({
        ok: false,
        error: "Geolocation is not supported on this device/browser.",
      });
      return;
    }

    const geoOpts = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        const { inside, distanceM } = isInsideVenue(lat, lng);

        const payload = {
          ok: true,
          lat,
          lng,
          accuracy,
          inside,
          distanceM,
        };

        setGeoCache(payload);
        resolve(payload);
      },
      (err) => {
        let msg = "Location permission denied or unavailable.";
        if (err?.code === 1) msg = "Location permission denied.";
        if (err?.code === 2) msg = "Location unavailable.";
        if (err?.code === 3) msg = "Location request timed out.";

        clearGeoCache();
        resolve({
          ok: false,
          error: msg,
        });
      },
      geoOpts
    );
  });
}