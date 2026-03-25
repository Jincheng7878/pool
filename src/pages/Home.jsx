import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import InstallButton from "../components/InstallButton.jsx";
import { usePersistedState } from "../lib/usePersistedState.js";

const LAST_TABLE_KEY = "poolroom:lastTableId";

export default function Home() {
  const [tableId, setTableId] = usePersistedState(LAST_TABLE_KEY, "T12");
  const nav = useNavigate();

  useEffect(() => {
    if (!tableId || typeof tableId !== "string") {
      setTableId("T12");
    }
  }, [tableId, setTableId]);

  function go(target) {
    const clean = (target ?? tableId ?? "").trim();
    if (!clean) return;
    nav(`/table/${encodeURIComponent(clean)}`);
  }

  return (
    <Layout
      title="Welcome"
      subtitle="Enter a table code or scan the QR code on your table to begin."
      badgeRight="Secure in-venue service"
    >
      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Join a Table</h3>
          <p className="p">Example: T12, A3, VIP1</p>

          <div className="row">
            <input
              value={tableId || ""}
              onChange={(e) => setTableId(e.target.value)}
              placeholder="Table code"
            />
            <button className="btn btnPrimary" onClick={() => go()}>
              Continue
            </button>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" to="/scan">
              Scan QR Code
            </Link>

            <InstallButton />

            {tableId && tableId.trim() ? (
              <button className="btn btnGhost" onClick={() => setTableId("")}>
                Clear
              </button>
            ) : null}
          </div>

          {tableId && tableId.trim() ? (
            <p className="small" style={{ marginTop: 10 }}>
              Last table available: <b>{tableId.trim()}</b>
            </p>
          ) : null}

          <p className="small" style={{ marginTop: 10 }}>
            Tip: the QR code should contain either a full table URL or just a table code such as{" "}
            <code>T12</code>.
          </p>
        </div>

        <div className="card">
          <h3 className="cardTitle">What you can do</h3>
          <ul className="p" style={{ margin: 0, paddingLeft: 18 }}>
            <li>Start a session and pay</li>
            <li>Order food & drinks from your table</li>
            <li>Request service (rack balls, call a waiter)</li>
            <li>Access the venue Wi-Fi details</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}