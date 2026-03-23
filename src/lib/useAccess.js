import { getSession } from "./session.js";
import { getGeoCache, requestGeolocation } from "./geo.js";

export function useAccess(tableId) {
  const session = getSession(tableId);
  const geo = getGeoCache();

  const insideVenue = !!geo?.inside;
  const hasPaidSession = !!session?.paid;

  let blockMessage = "";
  if (!insideVenue) {
    blockMessage = "You must be inside the venue to access table services.";
  } else if (!hasPaidSession) {
    blockMessage = "Start and pay for a session to unlock ordering and service features.";
  }

  async function verify() {
    return await requestGeolocation();
  }

  return {
    session,
    venue: {
      inside: insideVenue,
      badge: insideVenue ? "Inside venue" : "Outside venue",
      verify,
    },
    canOrder: insideVenue && hasPaidSession,
    blockMessage,
  };
}