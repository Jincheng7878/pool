import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import Layout from "../components/Layout.jsx";
import { requestGeolocation, clearGeoCache } from "../lib/geo.js";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment",
};

function extractTableId(rawValue) {
  const raw = (rawValue || "").trim();
  if (!raw) return null;

  const urlMatch = raw.match(/\/table\/([^/?#]+)/i);
  if (urlMatch?.[1]) {
    return decodeURIComponent(urlMatch[1]).trim();
  }

  const simpleCode = raw.match(/^[A-Za-z0-9_-]{1,20}$/);
  if (simpleCode) {
    return raw;
  }

  return null;
}

export default function Scan() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [status, setStatus] = useState("Waiting for camera access...");
  const [error, setError] = useState("");
  const [manualCode, setManualCode] = useState("T12");
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState("");

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleValidatedRedirect = useCallback(
    async (tableId) => {
      setStatus("Verifying venue location...");
      setError("");

      clearGeoCache();
      const geo = await requestGeolocation();

      if (!geo.ok) {
        setError(geo.error || "Location verification failed.");
        setStatus("Location verification failed.");
        return;
      }

      if (!geo.inside) {
        setError("You are outside the permitted venue area.");
        setStatus("Access blocked: outside venue.");
        return;
      }

      setStatus(`Verified. Opening table ${tableId}...`);
      navigate(`/table/${encodeURIComponent(tableId)}`);
    },
    [navigate]
  );

  const handleScanSuccess = useCallback(
    async (decodedText) => {
      const tableId = extractTableId(decodedText);

      if (!tableId) {
        setError("QR code detected, but the table code is not valid.");
        setLastResult(decodedText);
        return;
      }

      stopLoop();
      setLastResult(decodedText);
      await handleValidatedRedirect(tableId);
    },
    [handleValidatedRedirect, stopLoop]
  );

  const scanFrame = useCallback(() => {
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    if (!webcam || !canvas) return;
    if (!webcam.video) return;
    if (webcam.video.readyState !== 4) return;

    const video = webcam.video;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);

    const imageData = context.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code?.data) {
      handleScanSuccess(code.data);
    }
  }, [handleScanSuccess]);

  const startLoop = useCallback(() => {
    stopLoop();
    setError("");
    setStatus("Camera active. Point it at the table QR code.");
    setIsScanning(true);

    intervalRef.current = window.setInterval(() => {
      scanFrame();
    }, 700);
  }, [scanFrame, stopLoop]);

  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  async function handleManualContinue() {
    const clean = manualCode.trim();
    if (!clean) return;
    await handleValidatedRedirect(clean);
  }

  return (
    <Layout
      title="Scan QR Code"
      subtitle="Use your device camera to scan the QR code on the billiard table."
      badgeRight="Camera API"
    >
      <div className="grid2">
        <div className="card">
          <h3 className="cardTitle">Camera Scanner</h3>
          <p className="p">{status}</p>

          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored={false}
              onUserMedia={() => {
                setError("");
                setStatus("Camera ready. Starting scanner...");
                startLoop();
              }}
              onUserMediaError={() => {
                setError("Unable to access the camera. Please allow permission or use manual entry.");
                setStatus("Camera unavailable.");
                stopLoop();
              }}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {error ? <div className="toast">{error}</div> : null}

          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btnPrimary" onClick={startLoop}>
              Start Scanning
            </button>
            <button className="btn" onClick={stopLoop}>
              Stop
            </button>
          </div>

          {lastResult ? (
            <p className="small" style={{ marginTop: 10 }}>
              Last QR content: <code>{lastResult}</code>
            </p>
          ) : null}

          <p className="small" style={{ marginTop: 10 }}>
            Supported QR content: a full table URL or a simple code such as <code>T12</code>.
          </p>
        </div>

        <div className="card">
          <h3 className="cardTitle">Manual Fallback</h3>
          <p className="p">
            If camera access is blocked, you can still continue by entering the table code manually.
          </p>

          <div className="row">
            <input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter table code"
            />
            <button className="btn btnPrimary" onClick={handleManualContinue}>
              Continue
            </button>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn" to="/">
              Back to Home
            </Link>
          </div>

          <p className="small" style={{ marginTop: 10 }}>
            Example table codes: T12, A3, VIP1
          </p>
        </div>
      </div>
    </Layout>
  );
}