import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Table from "./pages/Table.jsx";
import StartSession from "./pages/StartSession.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import Service from "./pages/Service.jsx";
import Wifi from "./pages/Wifi.jsx";
import Staff from "./pages/Staff.jsx";
import Scan from "./pages/Scan.jsx";

import { ensureSeedData } from "./lib/seed.js";

export default function App() {
  useEffect(() => {
    try {
      ensureSeedData();
    } catch (e) {
      console.error("Seed init failed:", e);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/table/:tableId" element={<Table />} />
      <Route path="/table/:tableId/start" element={<StartSession />} />
      <Route path="/table/:tableId/menu" element={<Menu />} />
      <Route path="/table/:tableId/cart" element={<Cart />} />
      <Route path="/table/:tableId/service" element={<Service />} />
      <Route path="/table/:tableId/wifi" element={<Wifi />} />
      <Route path="/staff" element={<Staff />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}