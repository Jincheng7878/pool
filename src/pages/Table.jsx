import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import NavBar from "../components/NavBar.jsx";
import { listOrdersByTable, listServiceRequestsByTable } from "../lib/storage.js";
import { useAccess } from "../lib/useAccess.js";
import { usePersistedState } from "../lib/usePersistedState.js";
import { useSessionTimer } from "../lib/useSessionTimer.js";
import { endSession } from "../lib/session.js";

const LAST_TABLE_KEY = "poolroom:lastTableId";

export default function Table() {
  const { tableId } = useParams();
  const [, setLastTableId] = usePersistedState(LAST_TABLE_KEY, null);
  const expiredHandledRef = useRef(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (tableId) setLastTableId(tableId);
  }, [tableId, setLastTableId]);

  const access = useAccess(tableId);
  const orders = listOrdersByTable(tableId);
  const reqs = listServiceRequestsByTable(tableId);

  const timer = useSessionTimer(access.session?.endAt);

  useEffect(() => {
    if (!access.session) {
      expiredHandledRef.current = false;
      return;
    }

    if (timer.isExpired && !expiredHandledRef.current) {
      expiredHandledRef.current = true;
      endSession(tableId);
      setToast("Session expired automatically.");
      window.setTimeout(() => setToast(""), 1800);
    }
  }, [timer.isExpired, access.session, tableId]);

  const hasActiveSession = access.session && !timer.isExpired;
  const tableFee = Number(access.session?.tableFee || 0);
  const foodAndDrinksFee = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const grandTotal = tableFee + foodAndDrinksFee;

  function handleCheckout() {
    const summary = [
      `Table fee: £${tableFee.toFixed(2)}`,
      `Food & drinks: £${foodAndDrinksFee.toFixed(2)}`,
      `Grand total: £${grandTotal.toFixed(2)}`,
      "",
      "End session and checkout?"
    ].join("\n");

    const ok = window.confirm(summary);

    if (!ok) return;

    endSession(tableId);
    setToast("Session ended. Checkout completed.");
    window.setTimeout(() => setToast(""), 1800);
  }

  if (!access.venue.inside) {
    return (
      <Layout
        title="Location Restricted"
        subtitle="This table can only be accessed from inside the venue."
        badgeRight={`Table: ${tableId}`}
        locationBadge={access.venue.badge}
      >
        <NavBar tableId={tableId} />

        <div className="card">
          <h3 className="cardTitle">Access Blocked</h3>
          <p className="p">
            You are currently outside the permitted venue area. Please move inside the venue and verify your location again.
          </p>

          <div className="row">
            <button className="btn btnPrimary" onClick={access.venue.verify}>
              Verify Location
            </button>
            <Link className="btn" to="/">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Table Dashboard"
      subtitle="Manage your session, orders, and service requests."
      badgeRight={`Table: ${tableId}`}
      locationBadge={access.venue.badge}
    >
      <NavBar tableId={tableId} />

      {!access.canOrder ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 className="cardTitle">Access Status</h3>
          <p className="p">
            {access.blockMessage || "Complete the steps below to unlock services."}
          </p>
          <div className="row">
            <Link className="btn btnPrimary" to={`/table/${tableId}/start`}>
              Start & Pay
            </Link>
            <button className="btn" onClick={access.venue.verify}>
              Re-check location
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Session</h3>

          {hasActiveSession ? (
            <>
              <div className="kpi">
                <strong>
                  {timer.minutes}:{timer.seconds.toString().padStart(2, "0")}
                </strong>
                <span>Time remaining</span>
              </div>

              <p className="p">
                Started: {new Date(access.session.startAt).toLocaleString()}
              </p>

              <p className="p">
                Ends: {new Date(access.session.endAt).toLocaleTimeString()}
              </p>

              <div className="row">
                <Link className="btn btnPrimary" to={`/table/${tableId}/start`}>
                  Extend / Manage
                </Link>
                <Link className="btn" to={`/table/${tableId}/menu`}>
                  Browse Menu
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="p">No active session on this table.</p>
              <Link className="btn btnPrimary" to={`/table/${tableId}/start`}>
                Start a Session
              </Link>
            </>
          )}
        </div>

        <div className="card">
          <h3 className="cardTitle">End Session & Checkout</h3>

          {hasActiveSession ? (
            <>
              <div style={{ display: "grid", gap: 10 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="p" style={{ margin: 0 }}>Table Fee</span>
                  <span className="badge">£{tableFee.toFixed(2)}</span>
                </div>

                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="p" style={{ margin: 0 }}>Food & Drinks</span>
                  <span className="badge">£{foodAndDrinksFee.toFixed(2)}</span>
                </div>

                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="p" style={{ margin: 0, fontWeight: 700 }}>Grand Total</span>
                  <span className="badge">£{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn btnDanger" onClick={handleCheckout}>
                  End Session & Checkout
                </button>
              </div>
            </>
          ) : (
            <p className="p">Start a session to view checkout details.</p>
          )}
        </div>
      </div>

      {toast ? <div className="toast">{toast}</div> : null}

      <hr className="hr" />

      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="p">No orders yet.</p>
          ) : (
            <ul className="p" style={{ margin: 0, paddingLeft: 18 }}>
              {orders.slice(0, 4).map((o) => (
                <li key={o.id}>
                  <b>#{o.id.slice(-6)}</b> — £{o.total.toFixed(2)} — {o.status}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="cardTitle">Recent Service Requests</h3>
          {reqs.length === 0 ? (
            <p className="p">No requests yet.</p>
          ) : (
            <ul className="p" style={{ margin: 0, paddingLeft: 18 }}>
              {reqs.slice(0, 4).map((r) => (
                <li key={r.id}>
                  <b>{r.type}</b> — {r.status} —{" "}
                  {new Date(r.createdAt).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}