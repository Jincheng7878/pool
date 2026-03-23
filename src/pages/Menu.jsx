import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import NavBar from "../components/NavBar.jsx";
import { getMenu, addToCart } from "../lib/storage.js";
import { useAccess } from "../lib/useAccess.js";

export default function Menu() {
  const { tableId } = useParams();
  const access = useAccess(tableId);
  const menu = getMenu();

  const [toast, setToast] = useState("");

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of menu) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category).push(item);
    }
    return Array.from(map.entries());
  }, [menu]);

  function add(itemId) {
    if (!access.canOrder) {
      setToast(access.blockMessage || "Ordering is currently locked.");
      setTimeout(() => setToast(""), 1600);
      return;
    }
    addToCart(tableId, itemId, 1);
    setToast("Added to cart.");
    setTimeout(() => setToast(""), 1200);
  }

  return (
    <Layout
      title="Menu"
      subtitle="Browse items available at this venue."
      badgeRight={`Table: ${tableId}`}
      locationBadge={access.venue.badge}
    >
      <NavBar tableId={tableId} />

      {!access.canOrder ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 className="cardTitle">Ordering Locked</h3>
          <p className="p">{access.blockMessage}</p>
          <div className="row">
            <Link className="btn btnPrimary" to={`/table/${tableId}/start`}>Start & Pay</Link>
            <button className="btn" onClick={access.venue.verify}>Re-check location</button>
          </div>
        </div>
      ) : null}

      <div className="row" style={{ justifyContent: "space-between", margin: "10px 0" }}>
        <Link className="btn" to={`/table/${tableId}`}>Dashboard</Link>
        <Link className="btn btnPrimary" to={`/table/${tableId}/cart`}>View Cart</Link>
      </div>

      {grouped.map(([cat, items]) => (
        <div key={cat} className="card" style={{ marginTop: 14 }}>
          <h3 className="cardTitle">{cat}</h3>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            {items.map((i) => (
              <div key={i.id} className="card" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 750 }}>{i.name}</div>
                    <div className="small">Freshly served</div>
                  </div>
                  <div className="badge">£{i.price.toFixed(2)}</div>
                </div>
                <div className="row" style={{ marginTop: 10, justifyContent: "flex-end" }}>
                  <button
                    className="btn btnPrimary"
                    onClick={() => add(i.id)}
                    disabled={!access.canOrder}
                    style={{ opacity: access.canOrder ? 1 : 0.55 }}
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>

          {toast ? <div className="toast">{toast}</div> : null}
        </div>
      ))}
    </Layout>
  );
}
