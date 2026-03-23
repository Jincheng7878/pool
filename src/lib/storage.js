const KEY = "pool_room_app_v1";

function nowIso() {
  return new Date().toISOString();
}

function loadDb() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return {
      tables: {},
      sessions: {},
      menu: [],
      carts: {},
      orders: {},
      serviceRequests: {},
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(KEY);
    return loadDb();
  }
}

function saveDb(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** MENU */
export function getMenu() {
  return loadDb().menu;
}
export function setMenu(items) {
  const db = loadDb();
  db.menu = items;
  saveDb(db);
}

/** CART (CRUD) */
export function getCart(tableId) {
  const db = loadDb();
  return db.carts[tableId] ?? [];
}
export function addToCart(tableId, itemId, qty = 1) {
  const db = loadDb();
  const cart = db.carts[tableId] ?? [];
  const found = cart.find((x) => x.itemId === itemId);
  if (found) found.qty += qty;
  else cart.push({ itemId, qty });
  db.carts[tableId] = cart;
  saveDb(db);
}
export function updateCartQty(tableId, itemId, qty) {
  const db = loadDb();
  const cart = db.carts[tableId] ?? [];
  const found = cart.find((x) => x.itemId === itemId);
  if (!found) return;
  found.qty = qty;
  db.carts[tableId] = cart.filter((x) => x.qty > 0);
  saveDb(db);
}
export function clearCart(tableId) {
  const db = loadDb();
  db.carts[tableId] = [];
  saveDb(db);
}

/** ORDER (CRUD) */
export function createOrderFromCart(tableId) {
  const db = loadDb();
  const cart = db.carts[tableId] ?? [];
  if (cart.length === 0) throw new Error("Your cart is empty.");

  const menuMap = new Map(db.menu.map((m) => [m.id, m]));
  const items = cart
    .map((c) => {
      const m = menuMap.get(c.itemId);
      if (!m) return null;
      return { itemId: m.id, name: m.name, price: m.price, qty: c.qty };
    })
    .filter(Boolean);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const orderId = uid("order");
  const order = {
    id: orderId,
    tableId,
    items,
    total,
    status: "submitted",
    createdAt: nowIso(),
  };

  db.orders[orderId] = order;
  db.carts[tableId] = [];
  saveDb(db);
  return order;
}

export function listOrdersByTable(tableId) {
  const db = loadDb();
  return Object.values(db.orders)
    .filter((o) => o.tableId === tableId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function updateOrderStatus(orderId, status) {
  const db = loadDb();
  const order = db.orders[orderId];
  if (!order) return;
  order.status = status;
  saveDb(db);
}

/** SERVICE REQUEST (CRUD) */
export function createServiceRequest(tableId, type) {
  const db = loadDb();
  const id = uid("req");
  const req = {
    id,
    tableId,
    type,
    status: "pending",
    createdAt: nowIso(),
  };
  db.serviceRequests[id] = req;
  saveDb(db);
  return req;
}

export function listServiceRequestsByTable(tableId) {
  const db = loadDb();
  return Object.values(db.serviceRequests)
    .filter((r) => r.tableId === tableId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function updateServiceStatus(reqId, status) {
  const db = loadDb();
  const req = db.serviceRequests[reqId];
  if (!req) return;
  req.status = status;
  saveDb(db);
}

/** SESSION */
export function startSession(tableId, minutes) {
  const db = loadDb();
  const id = uid("sess");
  const sess = {
    id,
    tableId,
    minutes,
    paid: false,
    startAt: nowIso(),
  };
  db.sessions[id] = sess;
  db.tables[tableId] = { currentSessionId: id };
  saveDb(db);
  return sess;
}

export function getCurrentSession(tableId) {
  const db = loadDb();
  const t = db.tables[tableId];
  if (!t?.currentSessionId) return null;
  return db.sessions[t.currentSessionId] ?? null;
}

export function markSessionPaid(sessionId) {
  const db = loadDb();
  const sess = db.sessions[sessionId];
  if (!sess) return;
  sess.paid = true;
  saveDb(db);
}

/** STAFF HELPERS (read-only lists) */
export function listAllOrders() {
  const db = (function loadDbInner() {
    const raw = localStorage.getItem("pool_room_app_v1");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();
  if (!db?.orders) return [];
  return Object.values(db.orders).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function listAllServiceRequests() {
  const db = (function loadDbInner() {
    const raw = localStorage.getItem("pool_room_app_v1");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();
  if (!db?.serviceRequests) return [];
  return Object.values(db.serviceRequests).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function listKnownTables() {
  const db = (function loadDbInner() {
    const raw = localStorage.getItem("pool_room_app_v1");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();

  const set = new Set();

  // tables map
  if (db?.tables) Object.keys(db.tables).forEach((t) => set.add(t));

  // sessions
  if (db?.sessions) Object.values(db.sessions).forEach((s) => s?.tableId && set.add(s.tableId));

  // orders
  if (db?.orders) Object.values(db.orders).forEach((o) => o?.tableId && set.add(o.tableId));

  // service requests
  if (db?.serviceRequests) Object.values(db.serviceRequests).forEach((r) => r?.tableId && set.add(r.tableId));

  // Sort: try natural-ish sort (T2 < T12)
  const arr = Array.from(set);
  arr.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  return arr;
}
