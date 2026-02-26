import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Pedidos.css";

const API = "http://localhost:4000";

export default function Pedidos() {
  // cat├ílogo (productos desde BD)
  const [productos, setProductos] = useState([]);
  const [productoSel, setProductoSel] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  //carrito
  const [carrito, setCarrito] = useState([]);

  //clientes (para elegir a qui├®n va el pedido)
  const [clientes, setClientes] = useState([]);
  const [clienteSel, setClienteSel] = useState("");

  //progreso ÔÇ£env├¡oÔÇØ
  const [pedidoEnCurso, setPedidoEnCurso] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  //cargar productos y clientes al entrar
  useEffect(() => {
    const cargar = async () => {
      try {
        const [prods, clis] = await Promise.all([
          axios.get(`${API}/productos`),
          axios.get(`${API}/clientes`)
        ]);

        setProductos(prods.data);
        setClientes(clis.data);

        if (prods.data.length > 0) setProductoSel(prods.data[0]);
        if (clis.data.length > 0) setClienteSel(String(clis.data[0].id_cliente));
      } catch (e) {
        setError("No se pudieron cargar productos/clientes.");
      }
    };
    cargar();
  }, []);

  //total calculado (como recalcularTotal())
  const total = useMemo(() => {
    return carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  }, [carrito]);

  //a├▒adir al carrito (igual que tu l├│gica WinForms)
  const anadirCarrito = () => {
    setError("");
    setMsg("");

    if (pedidoEnCurso) return;
    if (!productoSel) {
      setError("Selecciona un producto del cat├ílogo.");
      return;
    }

    const cant = Number(cantidad);
    if (!Number.isInteger(cant) || cant <= 0) {
      setError("Cantidad inv├ílida.");
      return;
    }

    setCarrito((prev) => {
      const idx = prev.findIndex((x) => x.id_producto === productoSel.id_producto);

      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = {
          ...copia[idx],
          cantidad: copia[idx].cantidad + cant
        };
        return copia;
      }

      return [
        ...prev,
        {
          id_producto: productoSel.id_producto,
          nombre: productoSel.nombre,
          precio: Number(productoSel.precio),
          cantidad: cant
        }
      ];
    });
  };

  //eliminar l├¡nea seleccionada
  const eliminarLinea = (id_producto) => {
    if (pedidoEnCurso) return;
    setCarrito((prev) => prev.filter((x) => x.id_producto !== id_producto));
  };

  // finalizar pedido ÔÇ£progress barÔÇØ con setInterval
  const finalizarPedido = async () => {
    setError("");
    setMsg("");

    if (pedidoEnCurso) return;
    if (!clienteSel) {
      setError("Selecciona un cliente.");
      return;
    }
    if (carrito.length === 0) {
      setError("El carrito est├í vac├¡o. A├▒ade alg├║n producto.");
      return;
    }

    setPedidoEnCurso(true);
    setProgreso(0);

    //animaci├│n barra
    let p = 0;
    const t = setInterval(() => {
      p += 2;
      setProgreso(p);

      if (p >= 100) {
        clearInterval(t);
      }
    }, 35);

    //guardado en BD (en paralelo a la animaci├│n)
    try {
      const body = {
        id_cliente: Number(clienteSel),
        items: carrito.map((x) => ({ id_producto: x.id_producto, cantidad: x.cantidad }))
      };

      const resp = await axios.post(`${API}/pedidos`, body);

      //cuando acabe el progreso, reseteamos
      setTimeout(() => {
        setPedidoEnCurso(false);
        setCarrito([]);
        setProgreso(0);
        setMsg(`Pedido generado correctamente. ID: ${resp.data.pedido.id_pedido} | Total: ${resp.data.pedido.total.toFixed(2)} Ôé¼`);
      }, 400);
    } catch (e) {
      setPedidoEnCurso(false);
      setProgreso(0);
      const m = e?.response?.data?.error;
      setError(m || "Error creando el pedido.");
    }
  };

  return (
    <div className="pedidos-container">
      <h2 className="titulo">Pedidos</h2>

      <div className="top-row">
        <div className="bloque">
          <label>Cliente:</label>
          <select
            value={clienteSel}
            onChange={(e) => setClienteSel(e.target.value)}
            disabled={pedidoEnCurso}
          >
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido1} ({c.codigo_postal})
              </option>
            ))}
          </select>
        </div>

        <div className="bloque">
          <label>Producto:</label>
          <select
            value={productoSel?.id_producto || ""}
            onChange={(e) => {
              const id = Number(e.target.value);
              const p = productos.find((x) => x.id_producto === id);
              setProductoSel(p || null);
            }}
            disabled={pedidoEnCurso}
          >
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre} - {Number(p.precio).toFixed(2)} Ôé¼
              </option>
            ))}
          </select>
        </div>

        <div className="bloque">
          <label>Cantidad:</label>
          <input
            type="number"
            min="1"
            max="99"
            value={cantidad}
            onChange={(e) => setCantidad(Number(e.target.value))}
            disabled={pedidoEnCurso}
          />
        </div>

        <button className="btn btn-add" onClick={anadirCarrito} disabled={pedidoEnCurso}>
          A├▒adir carrito
        </button>
      </div>

      {error && <p className="msg error">{error}</p>}
      {msg && <p className="msg ok">{msg}</p>}

      <div className="grid">
        {/* Carrito */}
        <div className="panel">
          <h3>Carrito</h3>

          <div className="table-wrapper">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cant.</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {carrito.map((it) => (
                  <tr key={it.id_producto}>
                    <td>{it.nombre}</td>
                    <td style={{ textAlign: "center" }}>{it.cantidad}</td>
                    <td style={{ textAlign: "right" }}>{it.precio.toFixed(2)} Ôé¼</td>
                    <td style={{ textAlign: "right" }}>{(it.precio * it.cantidad).toFixed(2)} Ôé¼</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-del"
                        onClick={() => eliminarLinea(it.id_producto)}
                        disabled={pedidoEnCurso}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {!pedidoEnCurso && carrito.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", opacity: 0.8 }}>
                      Carrito vac├¡o
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="total">
            TOTAL: {total.toFixed(2)} Ôé¼
          </div>

          <button className="btn btn-finish" onClick={finalizarPedido} disabled={pedidoEnCurso}>
            Finalizar pedido
          </button>

          <div className="progress">
            <div className="bar" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
