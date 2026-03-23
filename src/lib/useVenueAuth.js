import { useEffect, useMemo, useState } from "react";
import { getGeoCache, requestGeolocation, setGeoCache } from "./geo.js";

export function useVenueAuth({ auto = true } = {}) {
  const [state, setState] = useState(() => {
    const cache = getGeoCache();
    if (cache?.ok) return { ...cache, loading: false, source: "cache" };
    return { loading: auto, ok: false, inside: false, source: "none" };
  });

  async function verify() {
    setState((s) => ({ ...s, loading: true, error: "" }));
    const res = await requestGeolocation();
    const payload = {
      ok: res.ok,
      inside: res.ok ? !!res.inside : false,
      lat: res.lat,
      lng: res.lng,
      accuracy: res.accuracy,
      distanceM: res.distanceM,
      error: res.error || "",
    };
    setGeoCache(payload);
    setState({ ...payload, loading: false, source: "live" });
    return payload;
  }

  useEffect(() => {
    if (!auto) return;
    const cache = getGeoCache();
    if (cache?.ok) {
      setState({ ...cache, loading: false, source: "cache" });
      return;
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badge = useMemo(() => {
    if (state.loading) return "Checking location…";
    if (!state.ok) return "Location needed";
    return state.inside ? "In venue ✅" : "Outside venue ❌";
  }, [state.loading, state.ok, state.inside]);

  return {
    ...state,
    badge,
    verify,
    canUseVenue: !!state.ok && !!state.inside,
  };
}
