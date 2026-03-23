const KEY = "pool_room_staff_auth_v1";

export const STAFF_PIN = "2468";

export function isStaffAuthed() {
  return localStorage.getItem(KEY) === "true";
}

export function staffLogin(pin) {
  if (pin === STAFF_PIN) {
    localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function staffLogout() {
  localStorage.removeItem(KEY);
}
