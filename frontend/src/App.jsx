import { Routes, Route, Link } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Pedidos from "./pages/Pedidos";

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Link to="/clientes">Clientes</Link>
        <Link to="/pedidos">Pedidos</Link>
      </nav>

      <Routes>
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/pedidos" element={<Pedidos />} />
      </Routes>
    </div>
  );
}