import { Link, useLocation } from "react-router-dom";

function itemStyle(active) {
  return {
    opacity: active ? 1 : 0.85,
    outline: active ? "2px solid rgba(124, 92, 255, 0.35)" : "none",
  };
}

export default function NavBar({ tableId }) {
  const { pathname } = useLocation();

  const items = [
    { to: `/table/${tableId}`, label: "Dashboard" },
    { to: `/table/${tableId}/start`, label: "Start & Pay" },
    { to: `/table/${tableId}/menu`, label: "Menu" },
    { to: `/table/${tableId}/cart`, label: "Cart" },
    { to: `/table/${tableId}/service`, label: "Service" },
    { to: `/table/${tableId}/wifi`, label: "Wi-Fi" },
    { to: `/scan`, label: "Scan QR" },
  ];

  return (
    <div className="nav">
      {items.map((i) => (
        <Link key={i.to} to={i.to} style={itemStyle(pathname === i.to)}>
          {i.label}
        </Link>
      ))}
    </div>
  );
}