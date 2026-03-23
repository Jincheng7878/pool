const SESSION_KEY = "poolroom_sessions_v1";

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function getSession(tableId) {
  const all = loadAll();
  const session = all[tableId];

  if (!session) return null;

  const now = Date.now();

  if (session.endAt && now >= session.endAt) {
    delete all[tableId];
    saveAll(all);
    return null;
  }

  return session;
}

export function startSession(tableId, minutes, tableFee = 0) {
  const all = loadAll();

  const startAt = Date.now();
  const endAt = startAt + minutes * 60 * 1000;

  const session = {
    tableId,
    minutes,
    startAt,
    endAt,
    paid: true,
    tableFee,
  };

  all[tableId] = session;
  saveAll(all);

  return session;
}

export function endSession(tableId) {
  const all = loadAll();
  delete all[tableId];
  saveAll(all);
}

export function extendSession(tableId, extraMinutes, extraFee = 0) {
  const all = loadAll();
  const session = all[tableId];

  if (!session) return null;

  const now = Date.now();

  if (session.endAt && now >= session.endAt) {
    delete all[tableId];
    saveAll(all);
    return null;
  }

  session.endAt = session.endAt + extraMinutes * 60 * 1000;
  session.minutes = Math.round((session.endAt - session.startAt) / 60000);
  session.tableFee = Number(session.tableFee || 0) + Number(extraFee || 0);

  all[tableId] = session;
  saveAll(all);

  return session;
}

export function getRemainingTime(tableId) {
  const session = getSession(tableId);
  if (!session) return 0;

  return Math.max(0, session.endAt - Date.now());
}

export function isSessionActive(tableId) {
  const session = getSession(tableId);
  return !!session;
}