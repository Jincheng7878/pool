import { Link } from "react-router-dom";

export default function Layout({
  title,
  subtitle,
  badgeRight,
  locationBadge,
  children,
}) {
  return (
    <div className="appBg">
      {/* Video Background */}
      <video
        className="bgVideo"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/videos/pool-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div className="bgOverlay" />

      {/* Main content */}
      <div className="container contentLayer">
        <div className="shell">
          <div className="topbar">
            <Link to="/" className="brand">
              <div className="brandMark" />
              <div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>Pool Room</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.68)",
                  }}
                >
                  Table Service
                </div>
              </div>
            </Link>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              {locationBadge ? <div className="badge">{locationBadge}</div> : null}
              {badgeRight ? <div className="badge">{badgeRight}</div> : null}
            </div>
          </div>

          <div className="content">
            {title ? <h1 className="h2">{title}</h1> : null}
            {subtitle ? <p className="p">{subtitle}</p> : null}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}