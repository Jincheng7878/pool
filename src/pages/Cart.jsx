import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import NavBar from "../components/NavBar.jsx";
import {
  getMenu,
  getCart,
  updateCartQty,
  clearCart,
  createOrderFromCart,
  listOrdersByTable,
} from "../lib/storage.js";
import { useAccess } from "../lib/useAccess.js";

export default function Cart() {
  const { tableId } = useParams();
  const access = useAccess(tableId);

  const menu = getMenu();
  const cart = getCart(tableId);
  const orders = listOrdersByTable(tableId);

  const [toast, setToast] = useState("");

  const menuMap = useMemo(() => new Map(menu.map((m) => [m.id, m])), [menu]);

  const lines = cart
    .map((c) => {
      const m = menuMap.get(c.itemId);
      if (!m) return null;
      return { ...c, name: m.name, price: m.price, lineTotal: m.price * c.qty };
    })
    .filter(Boolean);

  const total = lines.reduce((sum, x) => sum + x.lineTotal, 0);

  function changeQty(itemId, qty) {
    updateCartQty(tableId, itemId, qty);
    setToast("Cart updated.");
    setTimeout(() => window.location.reload(), 220);
  }

  function handleClear() {
    clearCart(tableId);
    setToast("Cart cleared.");
    setTimeout(() => window.location.reload(), 220);
  }

  function handleCheckout() {
    if (!access.canOrder) {
      setToast(access.blockMessage || "Ordering is currently locked.");
      setTimeout(() => setToast(""), 1600);
      return;
    }
    try {
      const order = createOrderFromCart(tableId);
      setToast(`Order submitted (#${order.id.slice(-6)}).`);
      setTimeout(() => window.location.reload(), 450);
    } catch (e) {
      setToast(e.message);
      setTimeout(() => setToast(""), 1400);
    }
  }

  return (
    <Layout
      title="Cart"
      subtitle="Review items, adjust quantities, and submit your order."
      badgeRight={`Table: ${tableId}`}
      locationBadge={access.venue.badge}
    >
      <NavBar tableId={tableId} />

      {!access.canOrder ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 className="cardTitle">Ordering Locked</h3>
          <p className="p">{access.blockMessage}</p>
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

      <div
        className="row"
        style={{ justifyContent: "space-between", margin: "10px 0" }}
      >
        <Link className="btn" to={`/table/${tableId}/menu`}>
          Back to Menu
        </Link>
        <Link className="btn" to={`/table/${tableId}`}>
          Dashboard
        </Link>
      </div>

      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Current Cart</h3>

          {lines.length === 0 ? (
            <p className="p">Your cart is empty.</p>
          ) : (
            <>
              {lines.map((x) => (
                <div
                  key={x.itemId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 0",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 750 }}>{x.name}</div>
                    <div className="small">£{x.price.toFixed(2)} each</div>
                  </div>

                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="btn"
                      onClick={() => changeQty(x.itemId, x.qty - 1)}
                    >
                      -
                    </button>
                    <span className="badge">Qty {x.qty}</span>
                    <button
                      className="btn"
                      onClick={() => changeQty(x.itemId, x.qty + 1)}
                    >
                      +
                    </button>
                    <span className="badge">£{x.lineTotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <hr className="hr" />

              <div className="kpi">
                <strong>£{total.toFixed(2)}</strong>
                <span>Total</span>
              </div>

              <div
                className="row"
                style={{ justifyContent: "flex-end", marginTop: 12 }}
              >
                <button className="btn btnDanger" onClick={handleClear}>
                  Clear
                </button>
                <button
                  className="btn btnPrimary"
                  onClick={handleCheckout}
                  disabled={!access.canOrder}
                  style={{ opacity: access.canOrder ? 1 : 0.55 }}
                >
                  Submit Order
                </button>
              </div>
            </>
          )}

          {toast ? <div className="toast">{toast}</div> : null}
        </div>

        <div className="card">
          <h3 className="cardTitle">Order History</h3>
          {orders.length === 0 ? (
            <p className="p">No orders yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {orders.slice(0, 6).map((o) => (
                <div
                  key={o.id}
                  className="card"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>#{o.id.slice(-6)}</div>
                      <div className="small">
                        {new Date(o.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="badge">£{o.total.toFixed(2)}</div>
                  </div>

                  <div className="row" style={{ marginTop: 10 }}>
                    <span className="badge">Status: {o.status}</span>
                  </div>

                  <div className="small" style={{ marginTop: 8 }}>
                    Staff will update the status when your order is being prepared or delivered.
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="small" style={{ marginTop: 10 }}>
            You can track updates here. For help, please use the Service page.
          </p>
        </div>
      </div>
    </Layout>
  );
}
