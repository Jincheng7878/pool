import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import NavBar from "../components/NavBar.jsx";
import { getSession, startSession, extendSession, endSession } from "../lib/session.js";
import { useSessionTimer } from "../lib/useSessionTimer.js";

const OPTIONS = [
  { label: "30 minutes", value: 30, price: 4.5 },
  { label: "60 minutes", value: 60, price: 8.0 },
  { label: "90 minutes", value: 90, price: 11.5 },
  { label: "120 minutes", value: 120, price: 15.0 },
];

export default function StartSession() {
  const { tableId } = useParams();
  const [selectedMinutes, setSelectedMinutes] = useState(60);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState("");

  const session = useMemo(() => getSession(tableId), [tableId, refreshKey]);
  const timer = useSessionTimer(session?.endAt);

  const selectedOption =
    OPTIONS.find((o) => o.value === selectedMinutes) || OPTIONS[1];

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function handleStart() {
    startSession(tableId, selectedOption.value, selectedOption.price);
    setRefreshKey((v) => v + 1);
    showToast(`Session started for ${selectedOption.value} minutes.`);
  }

  function handleExtend(extraMinutes) {
    let extraFee = 0;

    if (extraMinutes === 30) extraFee = 4.5;
    if (extraMinutes === 60) extraFee = 8.0;

    const updated = extendSession(tableId, extraMinutes, extraFee);

    if (!updated) {
      showToast("No active session found.");
      setRefreshKey((v) => v + 1);
      return;
    }

    setRefreshKey((v) => v + 1);
    showToast(`Session extended by ${extraMinutes} minutes.`);
  }

  function handleEnd() {
    endSession(tableId);
    setRefreshKey((v) => v + 1);
    showToast("Session ended.");
  }

  const hasActiveSession = session && !timer.isExpired;

  return (
    <Layout
      title="Start & Pay"
      subtitle="Choose a play duration and begin the table session."
      badgeRight={`Table: ${tableId}`}
    >
      <NavBar tableId={tableId} />

      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Session Status</h3>

          {hasActiveSession ? (
            <>
              <div className="kpi">
                <strong>
                  {timer.minutes}:{timer.seconds.toString().padStart(2, "0")}
                </strong>
                <span>Time remaining</span>
              </div>

              <p className="p">
                Started: {new Date(session.startAt).toLocaleString()}
              </p>
              <p className="p">
                Ends: {new Date(session.endAt).toLocaleString()}
              </p>
              <p className="p">
                Table fee so far: £{Number(session.tableFee || 0).toFixed(2)}
              </p>

              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => handleExtend(30)}>
                  Add 30 min (£4.50)
                </button>
                <button className="btn" onClick={() => handleExtend(60)}>
                  Add 60 min (£8.00)
                </button>
                <button className="btn btnDanger" onClick={handleEnd}>
                  End Session
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="p">No active session on this table.</p>
              <p className="small">
                Select a duration below, then start a new session.
              </p>
            </>
          )}

          {toast ? <div className="toast">{toast}</div> : null}
        </div>

        <div className="card">
          <h3 className="cardTitle">Choose Duration</h3>

          <div style={{ display: "grid", gap: 10 }}>
            {OPTIONS.map((option) => {
              const active = selectedMinutes === option.value;
              return (
                <button
                  key={option.value}
                  className="btn"
                  onClick={() => setSelectedMinutes(option.value)}
                  style={{
                    justifyContent: "space-between",
                    display: "flex",
                    width: "100%",
                    background: active
                      ? "rgba(124, 92, 255, 0.18)"
                      : "rgba(255,255,255,0.06)",
                    borderColor: active
                      ? "rgba(124, 92, 255, 0.35)"
                      : "rgba(255,255,255,0.12)",
                  }}
                >
                  <span>{option.label}</span>
                  <span>£{option.price.toFixed(2)}</span>
                </button>
              );
            })}
          </div>

          <hr className="hr" />

          <div className="kpi">
            <strong>{selectedOption.label}</strong>
            <span>£{selectedOption.price.toFixed(2)}</span>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={handleStart}>
              {hasActiveSession ? "Replace With New Session" : "Pay & Start Session"}
            </button>
            <Link className="btn" to={`/table/${tableId}`}>
              Back
            </Link>
          </div>

          <p className="small" style={{ marginTop: 10 }}>
            Starting a new session will overwrite any expired or previous session on this table.
          </p>
        </div>
      </div>
    </Layout>
  );
}