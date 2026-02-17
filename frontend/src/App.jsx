import { Routes, Route, Link } from "react-router-dom";
import Clientes from "./pages/Clientes";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link to="/clientes">Clientes</Link>
      </nav>

      <Routes>
        <Route path="/clientes" element={<Clientes />} />
      </Routes>
    </div>
  );
}