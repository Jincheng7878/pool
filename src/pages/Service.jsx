import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import NavBar from "../components/NavBar.jsx";
import { useAccess } from "../lib/useAccess.js";
import {
  createServiceRequest,
  listServiceRequestsByTable,
  updateServiceStatus,
} from "../lib/storage.js";

const SERVICE_OPTIONS = [
  { key: "rackBalls", label: "Rack Balls" },
  { key: "waiter", label: "Call Waiter" },
  { key: "payment", label: "Payment Help" },
  { key: "clean", label: "Clean Table" },
];

export default function Service() {
  const { tableId } = useParams();
  const access = useAccess(tableId);

  const [toast, setToast] = useState("");
  const requests = listServiceRequestsByTable(tableId);

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function handleCreate(type) {
    if (!access.canOrder) {
      showToast(access.blockMessage || "Service is currently locked.");
      return;
    }

    createServiceRequest(tableId, type);
    showToast("Service request sent.");
    window.setTimeout(() => window.location.reload(), 250);
  }

  function handleCancel(requestId) {
    updateServiceStatus(requestId, "cancelled");
    showToast("Request cancelled.");
    window.setTimeout(() => window.location.reload(), 250);
  }

  return (
    <Layout
      title="Service"
      subtitle="Request assistance directly from your table."
      badgeRight={`Table: ${tableId}`}
      locationBadge={access.venue.badge}
    >
      <NavBar tableId={tableId} />

      {!access.canOrder ? (
        <div className="card" style={{ marginBottom: 12 }}>
          <h3 className="cardTitle">Service Locked</h3>
          <p className="p">
            {access.blockMessage || "Complete the required steps to unlock service."}
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
          <h3 className="cardTitle">Request Service</h3>
          <p className="p">Choose the assistance you need.</p>

          <div style={{ display: "grid", gap: 10 }}>
            {SERVICE_OPTIONS.map((item) => (
              <button
                key={item.key}
                className="btn"
                onClick={() => handleCreate(item.key)}
                disabled={!access.canOrder}
                style={{ opacity: access.canOrder ? 1 : 0.55 }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {toast ? <div className="toast">{toast}</div> : null}
        </div>

        <div className="card">
          <h3 className="cardTitle">Recent Requests</h3>

          {requests.length === 0 ? (
            <p className="p">No service requests yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {requests.slice(0, 8).map((request) => (
                <div
                  key={request.id}
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
                      <div style={{ fontWeight: 800 }}>{request.type}</div>
                      <div className="small">
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="badge">{request.status}</div>
                  </div>

                  {request.status !== "cancelled" && request.status !== "done" ? (
                    <div className="row" style={{ marginTop: 10 }}>
                      <button
                        className="btn btnDanger"
                        onClick={() => handleCancel(request.id)}
                      >
                        Cancel Request
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
