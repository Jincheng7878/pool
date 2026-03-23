import { useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import { isStaffAuthed, staffLogin, staffLogout } from "../lib/staffAuth.js";
import {
  listAllOrders,
  listAllServiceRequests,
  listKnownTables,
  updateOrderStatus,
  updateServiceStatus,
} from "../lib/storage.js";

function prettyType(type) {
  if (type === "rackBalls") return "Rack Balls";
  if (type === "waiter") return "Call Waiter";
  if (type === "clean") return "Clean Table";
  return type || "Service";
}

function orderPriority(status) {
  // Lower number means higher priority
  if (status === "submitted") return 0;
  if (status === "preparing") return 1;
  if (status === "delivered") return 2;
  if (status === "cancelled") return 3;
  return 9;
}

function reqPriority(status) {
  if (status === "pending") return 0;
  if (status === "accepted") return 1;
  if (status === "done") return 2;
  if (status === "cancelled") return 3;
  return 9;
}

export default function Staff() {
  const [authed, setAuthed] = useState(isStaffAuthed());
  const [pin, setPin] = useState("");

  const [activeTable, setActiveTable] = useState("");
  const [orderFilter, setOrderFilter] = useState("all"); // all/submitted/preparing/delivered/cancelled
  const [toast, setToast] = useState("");

  function login() {
    const ok = staffLogin(pin.trim());
    if (!ok) {
      setToast("Invalid PIN.");
      setTimeout(() => setToast(""), 1200);
      return;
    }
    setAuthed(true);
    setToast("Logged in.");
    setTimeout(() => setToast(""), 900);
  }

  function logout() {
    staffLogout();
    setAuthed(false);
    setPin("");
    setActiveTable("");
  }

  // Data
  const tables = useMemo(() => listKnownTables(), [toast, authed]);
  const allOrders = useMemo(() => listAllOrders(), [toast, authed]);
  const allReqs = useMemo(() => listAllServiceRequests(), [toast, authed]);

  // Pick a default table if none selected
  const chosenTable = activeTable || tables[0] || "";

  const tableOrders = useMemo(() => {
    const list = allOrders
      .filter((o) => (chosenTable ? o.tableId === chosenTable : true))
      .filter((o) => (orderFilter === "all" ? true : o.status === orderFilter))
      .sort((a, b) => {
        const p = orderPriority(a.status) - orderPriority(b.status);
        if (p !== 0) return p;
        return a.createdAt < b.createdAt ? 1 : -1;
      });
    return list;
  }, [allOrders, chosenTable, orderFilter]);

  const tableReqs = useMemo(() => {
    const list = allReqs
      .filter((r) => (chosenTable ? r.tableId === chosenTable : true))
      .sort((a, b) => {
        const p = reqPriority(a.status) - reqPriority(b.status);
        if (p !== 0) return p;
        return a.createdAt < b.createdAt ? 1 : -1;
      });
    return list;
  }, [allReqs, chosenTable]);

  // Summary badges per table
  const tableSummary = useMemo(() => {
    const map = new Map();
    for (const t of tables) {
      map.set(t, { submitted: 0, pending: 0 });
    }
    for (const o of allOrders) {
      if (!map.has(o.tableId)) map.set(o.tableId, { submitted: 0, pending: 0 });
      if (o.status === "submitted") map.get(o.tableId).submitted += 1;
    }
    for (const r of allReqs) {
      if (!map.has(r.tableId)) map.set(r.tableId, { submitted: 0, pending: 0 });
      if (r.status === "pending") map.get(r.tableId).pending += 1;
    }
    return map;
  }, [tables, allOrders, allReqs]);

  function setOrder(id, status) {
    updateOrderStatus(id, status);
    setToast(`Order updated: ${status}`);
    setTimeout(() => setToast(""), 700);
  }

  function setReq(id, status) {
    updateServiceStatus(id, status);
    setToast(`Request updated: ${status}`);
    setTimeout(() => setToast(""), 700);
  }

  return (
    <Layout
      title="Staff Panel"
      subtitle="Internal operations only."
      badgeRight={authed ? "Staff: Active" : "Staff: Locked"}
    >
      {!authed ? (
        <div className="card">
          <h3 className="cardTitle">Staff Login</h3>
          <p className="p">Enter staff PIN to access operations.</p>
          <div className="row">
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Staff PIN"
              type="password"
            />
            <button className="btn btnPrimary" onClick={login}>
              Login
            </button>
          </div>
          {toast ? <div className="toast">{toast}</div> : null}
        </div>
      ) : (
        <>
          <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <h3 className="cardTitle">Operations Dashboard</h3>
                <p className="p">
                  Pick a table. New orders and pending requests are prioritised.
                </p>
              </div>
              <button className="btn btnDanger" onClick={logout}>
                Logout
              </button>
            </div>

            {toast ? <div className="toast">{toast}</div> : null}
          </div>

          <div className="grid2" style={{ marginTop: 14 }}>
            {/* LEFT: TABLE LIST */}
            <div className="card">
              <h3 className="cardTitle">Tables</h3>

              {tables.length === 0 ? (
                <p className="p">No tables found yet. Create an order or request first.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {tables.map((t) => {
                    const s = tableSummary.get(t) || { submitted: 0, pending: 0 };
                    const active = chosenTable === t;
                    return (
                      <button
                        key={t}
                        className="btn"
                        onClick={() => setActiveTable(t)}
                        style={{
                          justifyContent: "space-between",
                          display: "flex",
                          width: "100%",
                          background: active ? "rgba(124, 92, 255, 0.18)" : "rgba(255,255,255,0.06)",
                          borderColor: active ? "rgba(124, 92, 255, 0.35)" : "rgba(255,255,255,0.12)",
                        }}
                      >
                        <span style={{ fontWeight: 800 }}>{t}</span>
                        <span className="row" style={{ gap: 8 }}>
                          {s.submitted > 0 ? (
                            <span className="badge">New: {s.submitted}</span>
                          ) : (
                            <span className="badge">New: 0</span>
                          )}
                          {s.pending > 0 ? (
                            <span className="badge">Requests: {s.pending}</span>
                          ) : (
                            <span className="badge">Requests: 0</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: TABLE DETAILS */}
            <div className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <h3 className="cardTitle">Table: {chosenTable || "—"}</h3>
                  <p className="p">Manage orders and service requests.</p>
                </div>
                <div className="row">
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                    style={{ width: 210 }}
                  >
                    <option value="all">All orders</option>
                    <option value="submitted">Submitted</option>
                    <option value="preparing">Preparing</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <hr className="hr" />

              <h3 className="cardTitle">Orders</h3>
              {tableOrders.length === 0 ? (
                <p className="p">No matching orders.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {tableOrders.slice(0, 12).map((o) => (
                    <div
                      key={o.id}
                      className="card"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 900 }}>#{o.id.slice(-6)}</div>
                          <div className="small">{new Date(o.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="row" style={{ justifyContent: "flex-end" }}>
                          <span className="badge">£{o.total.toFixed(2)}</span>
                          <span className="badge">Status: {o.status}</span>
                        </div>
                      </div>

                      <div className="row" style={{ marginTop: 10 }}>
                        <button className="btn" onClick={() => setOrder(o.id, "preparing")}>
                          Preparing
                        </button>
                        <button className="btn" onClick={() => setOrder(o.id, "delivered")}>
                          Delivered
                        </button>
                        <button className="btn btnDanger" onClick={() => setOrder(o.id, "cancelled")}>
                          Cancel
                        </button>
                      </div>

                      <div className="small" style={{ marginTop: 8 }}>
                        Items: {o.items?.map((it) => `${it.name} x${it.qty}`).join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr className="hr" />

              <h3 className="cardTitle">Service Requests</h3>
              {tableReqs.length === 0 ? (
                <p className="p">No requests for this table.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {tableReqs.slice(0, 12).map((r) => (
                    <div
                      key={r.id}
                      className="card"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>{prettyType(r.type)}</div>
                        <div className="row" style={{ justifyContent: "flex-end" }}>
                          <span className="badge">Status: {r.status}</span>
                        </div>
                      </div>
                      <div className="small" style={{ marginTop: 6 }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </div>
                      <div className="row" style={{ marginTop: 10 }}>
                        <button className="btn" onClick={() => setReq(r.id, "accepted")}>
                          Accept
                        </button>
                        <button className="btn" onClick={() => setReq(r.id, "done")}>
                          Done
                        </button>
                        <button className="btn btnDanger" onClick={() => setReq(r.id, "cancelled")}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
