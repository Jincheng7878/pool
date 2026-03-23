import { useParams } from "react-router-dom";
import { useState } from "react";
import Layout from "../components/Layout.jsx";
import NavBar from "../components/NavBar.jsx";
import { useVenueAuth } from "../lib/useVenueAuth.js";

export default function Wifi() {
  const { tableId } = useParams();
  const venue = useVenueAuth({ auto: true });
  const [toast, setToast] = useState("");

  const ssid = "PoolRoom_WIFI";
  const password = "pool123456";

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`${label} copied.`);
      setTimeout(() => setToast(""), 1200);
    } catch {
      setToast("Copy failed. Please use HTTPS or localhost.");
      setTimeout(() => setToast(""), 1600);
    }
  }

  return (
    <Layout
      title="Wi-Fi"
      subtitle="Connect to the venue network in seconds."
      badgeRight={`Table: ${tableId}`}
      locationBadge={venue.badge}
    >
      <NavBar tableId={tableId} />

      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Network Details</h3>

          <div className="card" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="kpi">
              <strong>{ssid}</strong>
              <span>SSID</span>
            </div>
            <div className="row" style={{ marginTop: 10, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => copy(ssid, "SSID")}>Copy SSID</button>
            </div>
          </div>

          <div className="card" style={{ background: "rgba(255,255,255,0.04)", marginTop: 10 }}>
            <div className="kpi">
              <strong>{password}</strong>
              <span>Password</span>
            </div>
            <div className="row" style={{ marginTop: 10, justifyContent: "flex-end" }}>
              <button className="btn btnPrimary" onClick={() => copy(password, "Password")}>Copy Password</button>
            </div>
          </div>

          {toast ? <div className="toast">{toast}</div> : null}
        </div>

        <div className="card">
          <h3 className="cardTitle">Tips</h3>
          <p className="p">If copy is blocked, open via HTTPS or on the venue network.</p>
          <p className="p">You can later add a Wi-Fi QR code for one-tap setup.</p>
        </div>
      </div>
    </Layout>
  );
}
