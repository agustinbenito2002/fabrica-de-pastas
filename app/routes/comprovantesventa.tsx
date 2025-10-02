import React, { useState, useEffect } from "react";

const LOCAL_STORAGE_KEY = "comprobantes-listado";

const comprobantesEjemplo = [
  {
    id: 1,
    fecha: "2025-09-30",
    cliente: "Juan Pérez",
    nroPedido: "A001",
    productos: [
      { nombre: "Fideos", cantidad: 5, precio: 100 },
      { nombre: "Ravioles", cantidad: 2, precio: 150 },
    ],
  },
  {
    id: 2,
    fecha: "2025-09-29",
    cliente: "María Gómez",
    nroPedido: "A002",
    productos: [
      { nombre: "Tallarines", cantidad: 3, precio: 90 },
    ],
  },
];

function calcularTotal(productos: { cantidad: number; precio: number }[]) {
  return productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0);
}

type Producto = { nombre: string; cantidad: number; precio: number };
type Comprobante = {
  id: number;
  fecha: string;
  cliente: string;
  nroPedido: string;
  productos: Producto[];
};

const ComprobantesVentaPage: React.FC = () => {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : comprobantesEjemplo;
  });
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [nuevoComprobante, setNuevoComprobante] = useState<{
    fecha: string;
    cliente: string;
    nroPedido: string;
    productos: Producto[];
  }>({
    fecha: "",
    cliente: "",
    nroPedido: "",
    productos: [{ nombre: "", cantidad: 1, precio: 0 }],
  });
  const [editComprobante, setEditComprobante] = useState<Comprobante | null>(null);
  const [errorAdd, setErrorAdd] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comprobantes));
  }, [comprobantes]);

  const comprobantesFiltrados = comprobantes.filter(c =>
    c.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nroPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.fecha.includes(busqueda)
  );

  const handleComprobanteClick = (id: number) => {
    setComprobanteSeleccionado(id);
    setShowPopup(true);
  };

  const handleAddComprobante = () => {
    const prod = nuevoComprobante.productos[0];
    if (
      !nuevoComprobante.fecha.trim() ||
      !nuevoComprobante.cliente.trim() ||
      !nuevoComprobante.nroPedido.trim() ||
      !prod.nombre.trim() ||
      prod.cantidad <= 0 ||
      prod.precio <= 0
    ) {
      setErrorAdd("Completa todos los campos correctamente.");
      return;
    }
    setComprobantes([
      ...comprobantes,
      {
        id: comprobantes.length ? comprobantes[comprobantes.length - 1].id + 1 : 1,
        fecha: nuevoComprobante.fecha,
        cliente: nuevoComprobante.cliente,
        nroPedido: nuevoComprobante.nroPedido,
        productos: [...nuevoComprobante.productos],
      },
    ]);
    setShowAddPopup(false);
    setNuevoComprobante({
      fecha: "",
      cliente: "",
      nroPedido: "",
      productos: [{ nombre: "", cantidad: 1, precio: 0 }],
    });
    setErrorAdd("");
  };

  const handleModificar = () => {
    const comprobante = comprobantes.find(c => c.id === comprobanteSeleccionado);
    if (comprobante) {
      setEditComprobante({ ...comprobante });
      setShowPopup(false);
      setShowEditPopup(true);
    }
  };

  const handleEditSave = () => {
    if (!editComprobante) return;
    const prod = editComprobante.productos[0];
    if (
      !editComprobante.fecha.trim() ||
      !editComprobante.cliente.trim() ||
      !editComprobante.nroPedido.trim() ||
      !prod.nombre.trim() ||
      prod.cantidad <= 0 ||
      prod.precio <= 0
    ) {
      setErrorAdd("Completa todos los campos correctamente.");
      return;
    }
    setComprobantes(comprobantes.map(c =>
      c.id === editComprobante.id ? { ...editComprobante } : c
    ));
    setShowEditPopup(false);
    setEditComprobante(null);
    setErrorAdd("");
  };

  const handleEliminar = () => {
    setComprobantes(comprobantes.filter(c => c.id !== comprobanteSeleccionado));
    setShowPopup(false);
    setComprobanteSeleccionado(null);
  };

  const handleProductoChange = (field: keyof Producto, value: any, edit = false) => {
    if (edit && editComprobante) {
      setEditComprobante({
        ...editComprobante,
        productos: [
          {
            ...editComprobante.productos[0],
            [field]: field === "cantidad" || field === "precio" ? Number(value) : value,
          },
        ],
      });
    } else {
      setNuevoComprobante({
        ...nuevoComprobante,
        productos: [
          {
            ...nuevoComprobante.productos[0],
            [field]: field === "cantidad" || field === "precio" ? Number(value) : value,
          },
        ],
      });
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <input
        type="text"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por cliente, nro de pedido o fecha"
        style={{
          marginBottom: 16,
          width: "100%",
          padding: 8,
          fontSize: 16,
          borderRadius: 4,
          border: "1px solid #ccc"
        }}
      />
      <button
        style={{
          marginBottom: 24,
          padding: "8px 16px",
          fontSize: 16,
          background: "#1890ff",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer"
        }}
        onClick={() => setShowAddPopup(true)}
      >
        Registrar comprobante
      </button>
      <h2>Comprobantes de Venta</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Fecha</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Nro Pedido</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Cliente</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Productos</th>
            <th style={{ border: "1px solid #ddd", padding: 8 }}>Precio Total</th>
          </tr>
        </thead>
        <tbody>
          {comprobantesFiltrados.map((comprobante) => (
            <tr
              key={comprobante.id}
              style={{
                background: comprobanteSeleccionado === comprobante.id ? "#e6f7ff" : "#fff",
                cursor: "pointer"
              }}
              onClick={() => handleComprobanteClick(comprobante.id)}
            >
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{comprobante.fecha}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{comprobante.nroPedido}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>{comprobante.cliente}</td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                {comprobante.productos.map((prod, idx) => (
                  <div key={idx}>
                    {prod.nombre} (x{prod.cantidad}) - ${prod.precio}
                  </div>
                ))}
              </td>
              <td style={{ border: "1px solid #ddd", padding: 8 }}>
                ${calcularTotal(comprobante.productos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pop-up de opciones comprobante */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              minWidth: 300,
              textAlign: "center"
            }}
          >
            <h3>Opciones del comprobante</h3>
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#52c41a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={handleModificar}
            >
              Modificar
            </button>
            <br />
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#ff4d4f",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={handleEliminar}
            >
              Eliminar
            </button>
            <br />
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#eee",
                color: "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={() => setShowPopup(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* Pop-up para agregar comprobante */}
      {showAddPopup && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              minWidth: 350,
              textAlign: "center"
            }}
          >
            <h3>Registrar comprobante</h3>
            <input
              type="date"
              value={nuevoComprobante.fecha}
              onChange={e => setNuevoComprobante({ ...nuevoComprobante, fecha: e.target.value })}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Fecha"
            /><br />
            <input
              type="text"
              value={nuevoComprobante.nroPedido}
              onChange={e => setNuevoComprobante({ ...nuevoComprobante, nroPedido: e.target.value })}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Nro Pedido"
            /><br />
            <input
              type="text"
              value={nuevoComprobante.cliente}
              onChange={e => setNuevoComprobante({ ...nuevoComprobante, cliente: e.target.value })}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Cliente"
            /><br />
            <input
              type="text"
              value={nuevoComprobante.productos[0].nombre}
              onChange={e => handleProductoChange("nombre", e.target.value)}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Producto"
            /><br />
            <input
              type="number"
              value={nuevoComprobante.productos[0].cantidad}
              min={1}
              onChange={e => handleProductoChange("cantidad", e.target.value)}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Cantidad"
            /><br />
            <input
              type="number"
              value={nuevoComprobante.productos[0].precio}
              min={1}
              onChange={e => handleProductoChange("precio", e.target.value)}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Precio unitario"
            /><br />
            {errorAdd && (
              <div style={{ color: "red", marginBottom: 8 }}>{errorAdd}</div>
            )}
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#1890ff",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={handleAddComprobante}
            >
              Guardar
            </button>
            <br />
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#eee",
                color: "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={() => {
                setShowAddPopup(false);
                setErrorAdd("");
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* Pop-up para editar comprobante */}
      {showEditPopup && editComprobante && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              minWidth: 350,
              textAlign: "center"
            }}
          >
            <h3>Modificar comprobante</h3>
            <input
              type="date"
              value={editComprobante.fecha}
              onChange={e => setEditComprobante({ ...editComprobante, fecha: e.target.value })}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Fecha"
            /><br />
            <input
              type="text"
              value={editComprobante.nroPedido}
              onChange={e => setEditComprobante({ ...editComprobante, nroPedido: e.target.value })}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Nro Pedido"
            /><br />
            <input
              type="text"
              value={editComprobante.cliente}
              onChange={e => setEditComprobante({ ...editComprobante, cliente: e.target.value })}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Cliente"
            /><br />
            <input
              type="text"
              value={editComprobante.productos[0].nombre}
              onChange={e => handleProductoChange("nombre", e.target.value, true)}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Producto"
            /><br />
            <input
              type="number"
              value={editComprobante.productos[0].cantidad}
              min={1}
              onChange={e => handleProductoChange("cantidad", e.target.value, true)}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Cantidad"
            /><br />
            <input
              type="number"
              value={editComprobante.productos[0].precio}
              min={1}
              onChange={e => handleProductoChange("precio", e.target.value, true)}
              style={{ marginBottom: 8, width: "90%", padding: 8 }}
              placeholder="Precio unitario"
            /><br />
            {errorAdd && (
              <div style={{ color: "red", marginBottom: 8 }}>{errorAdd}</div>
            )}
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#52c41a",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={handleEditSave}
            >
              Guardar cambios
            </button>
            <br />
            <button
              style={{
                margin: "8px 0",
                padding: "8px 16px",
                fontSize: 16,
                background: "#eee",
                color: "#333",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
              onClick={() => {
                setShowEditPopup(false);
                setEditComprobante(null);
                setErrorAdd("");
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprobantesVentaPage;