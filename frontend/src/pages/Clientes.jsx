import { useEffect, useState } from "react";
import axios from "axios";
import "./Clientes.css";

const API = "http://localhost:4000";

export default function Clientes() {
  // ESTADOS
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // formulario (sirve para añadir y editar)
  const [form, setForm] = useState({
    id_cliente: null,
    nombre: "",
    apellido1: "",
    apellido2: "",
    email: "",
    codigo_postal: "",
    activo: true
  });

  const [modoEdicion, setModoEdicion] = useState(false);

  // CARGAR CLIENTES (LIST + SEARCH)
  const cargarClientes = async () => {
    try {
      setError("");
      setCargando(true);

      const url = busqueda.trim()
        ? `${API}/clientes?search=${encodeURIComponent(busqueda.trim())}`
        : `${API}/clientes`;

      const resp = await axios.get(url);
      setClientes(resp.data);
    } catch (e) {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setCargando(false);
    }
  };

  //Cada vez que cambie busqueda, espera 250ms y luego llama a cargarClientes().
  //Si vuelve a cambiar antes de 250ms, cancela la llamada anterior
  useEffect(() => {
    const t = setTimeout(() => {
      cargarClientes();
    }, 250); // mini debounce para no pedir a cada tecla qe se pulse

    return () => clearTimeout(t);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);



  //MANEJO FORMULARIO
  const onChangeForm = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const limpiarForm = () => {
    setForm({
      id_cliente: null,
      nombre: "",
      apellido1: "",
      apellido2: "",
      email: "",
      codigo_postal: "",
      activo: true
    });
    setModoEdicion(false);
  };

  const cargarParaEditar = (cliente) => {
    setForm({
      id_cliente: cliente.id_cliente,
      nombre: cliente.nombre,
      apellido1: cliente.apellido1,
      apellido2: cliente.apellido2,
      email: cliente.email,
      codigo_postal: cliente.codigo_postal,
      activo: Boolean(cliente.activo)
    });
    setModoEdicion(true);
  };

  // -------------------------
  // CREATE / UPDATE
  // -------------------------
  const guardar = async (e) => {
    e.preventDefault();
    setError("");

    // validación mínima
    if (!form.nombre || !form.apellido1 || !form.apellido2 || !form.email || !form.codigo_postal) {
      setError("Rellena todos los campos obligatorios.");
      return;
    }

    try {
      if (!modoEdicion) {
        // CREATE
        await axios.post(`${API}/clientes`, {
          nombre: form.nombre,
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          email: form.email,
          codigo_postal: form.codigo_postal,
          activo: form.activo
        });
      } else {
        // UPDATE
        await axios.put(`${API}/clientes/${form.id_cliente}`, {
          nombre: form.nombre,
          apellido1: form.apellido1,
          apellido2: form.apellido2,
          email: form.email,
          codigo_postal: form.codigo_postal,
          activo: form.activo
        });
      }

      limpiarForm();
      cargarClientes();
    } catch (e) {
      const msg = e?.response?.data?.error;
      setError(msg || "Error guardando el cliente.");
    }
  };

  // -------------------------
  // DELETE
  // -------------------------
  const eliminar = async (id_cliente) => {
    const ok = confirm("¿Seguro que quieres eliminar este cliente?");
    if (!ok) return;

    try {
      await axios.delete(`${API}/clientes/${id_cliente}`);
      // si estaba editando ese cliente, limpio
      if (form.id_cliente === id_cliente) limpiarForm();
      cargarClientes();
    } catch (e) {
      const msg = e?.response?.data?.error;
      setError(msg || "No se pudo eliminar el cliente.");
    }
  };

  // -------------------------
  // UI
  // -------------------------
return (
  <div className="clientes-container">
    {/* IZQUIERDA: TABLA */}
    <div className="card">
      <h2>Clientes</h2>

      <div className="search-bar">
        <input
          placeholder="Buscar (nombre, apellidos, email, cp...)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button onClick={cargarClientes}>Recargar</button>
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div className="table-wrapper">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido 1</th>
              <th>Apellido 2</th>
              <th>E-mail</th>
              <th>CP</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {clientes.map((c) => (
              <tr key={c.id_cliente}>
                <td>{c.nombre}</td>
                <td>{c.apellido1}</td>
                <td>{c.apellido2}</td>
                <td>{c.email}</td>
                <td>{c.codigo_postal}</td>
                <td>{c.activo ? "Sí" : "No"}</td>
                <td>
                  <button
                    className="btn btn-edit"
                    onClick={() => cargarParaEditar(c)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => eliminar(c.id_cliente)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {!cargando && clientes.length === 0 && (
              <tr>
                <td colSpan={7}>No hay resultados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* DERECHA: FORM */}
    <div className="card">
      <h2>{modoEdicion ? "Editar cliente" : "Añadir cliente"}</h2>

      <form onSubmit={guardar} className="form-grid">
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={onChangeForm}
        />
        <input
          name="apellido1"
          placeholder="Apellido 1"
          value={form.apellido1}
          onChange={onChangeForm}
        />
        <input
          name="apellido2"
          placeholder="Apellido 2"
          value={form.apellido2}
          onChange={onChangeForm}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChangeForm}
        />
        <input
          name="codigo_postal"
          placeholder="Código Postal"
          value={form.codigo_postal}
          onChange={onChangeForm}
        />

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="activo"
            checked={form.activo}
            onChange={onChangeForm}
          />
          Activo
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {modoEdicion ? "Guardar cambios" : "Crear cliente"}
          </button>

          <button
            type="button"
            onClick={limpiarForm}
            className="btn btn-secondary"
          >
            Limpiar
          </button>
        </div>
      </form>

      <p style={{ fontSize: 12, opacity: 0.8, marginTop: 10 }}>
        * El formulario se reutiliza para CREATE y UPDATE.
      </p>
    </div>
  </div>
);
}
// estilos tipo “dgv”
const th = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: 8,
  background: "#f3f3f3",
  whiteSpace: "nowrap"
};

const td = {
  borderBottom: "1px solid #eee",
  padding: 8,
  verticalAlign: "top",
  whiteSpace: "nowrap"
};
