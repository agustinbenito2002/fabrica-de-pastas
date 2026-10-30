import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, InputNumber, Space, message, Table, Select } from "antd";
import { getProductosRegistrados } from "../utils/productos";
import type { ProductoRegistrado } from "../utils/productos";
import { PageHeader } from "../components/PageHeader";
import { numberSorter, textSorter } from "../utils/tableSort";
import { getNextId } from "../utils/recordIds";

const LOCAL_STORAGE_KEY = "comprobantes-listado";
const CLIENTES_STORAGE_KEY = "clientes-listado";

const clientesIniciales = [
  { id: 1, nombre: "Juan Pérez" },
  { id: 2, nombre: "María Gómez" },
  { id: 3, nombre: "Carlos López" }
];

type ClienteRegistrado = {
  id: number;
  nombre: string;
  dni?: string;
  cuit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  tipoCliente?: string;
  nombreComercio?: string;
  segmentoComercial?: string;
  condicionPago?: string;
};

type DatosCliente = Pick<
  ClienteRegistrado,
  | "nombre"
  | "dni"
  | "cuit"
  | "email"
  | "telefono"
  | "direccion"
  | "ciudad"
  | "provincia"
  | "tipoCliente"
  | "nombreComercio"
  | "segmentoComercial"
  | "condicionPago"
>;

function getClientesRegistrados(): ClienteRegistrado[] {
  const saved = localStorage.getItem(CLIENTES_STORAGE_KEY);
  if (!saved) return clientesIniciales;

  try {
    const clientes = JSON.parse(saved);
    return Array.isArray(clientes) ? clientes as ClienteRegistrado[] : clientesIniciales;
  } catch {
    return clientesIniciales;
  }
}

const { Option } = Select;

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
    productos: [{ nombre: "Tallarines", cantidad: 3, precio: 90 }],
  },
];

function calcularTotal(productos: { cantidad: number; precio: number }[] = []) {
  if (!Array.isArray(productos)) return 0;

  return productos.reduce(
    (acc, producto) => acc + (Number(producto?.cantidad) || 0) * (Number(producto?.precio) || 0),
    0
  );
}

type Producto = { id?: number; nombre: string; cantidad: number; precio: number };
type Comprobante = {
  id: number;
  fecha: string;
  cliente: string;
  clienteDatos?: DatosCliente;
  nroPedido?: string;
  productos: Producto[];
};

interface ComprobantesVentaPageProps {
  abrirNuevo?: boolean;
}

const ComprobantesVentaPage: React.FC<ComprobantesVentaPageProps> = ({ abrirNuevo = false }) => {
  const [comprobantes, setComprobantes] = useState<Comprobante[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : comprobantesEjemplo;
  });

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingComprobante, setEditingComprobante] = useState<Comprobante | null>(null);
  const [isViewingComprobante, setIsViewingComprobante] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [clientes, setClientes] = useState(getClientesRegistrados);
  const [productos, setProductos] = useState<ProductoRegistrado[]>(getProductosRegistrados);
  const [form] = Form.useForm();
  const watchedProductos: Producto[] = Form.useWatch("productos", form) ?? [];
  const watchedCliente: string | undefined = Form.useWatch("cliente", form);
  const totalComprobante = calcularTotal(watchedProductos);
  const clienteRegistrado = clientes.find((cliente) => cliente.nombre === watchedCliente);
  const clienteSeleccionado =
    editingComprobante && editingComprobante.cliente === watchedCliente && editingComprobante.clienteDatos
      ? editingComprobante.clienteDatos
      : clienteRegistrado;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

  // Guardar cambios automáticamente
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comprobantes));
  }, [comprobantes]);

  useEffect(() => {
    const actualizarClientes = () => setClientes(getClientesRegistrados());
    window.addEventListener("storage", actualizarClientes);
    return () => window.removeEventListener("storage", actualizarClientes);
  }, []);

  useEffect(() => {
    const actualizarProductos = () => setProductos(getProductosRegistrados());
    window.addEventListener("storage", actualizarProductos);
    return () => window.removeEventListener("storage", actualizarProductos);
  }, []);

  const comprobantesFiltrados = comprobantes.filter(
    (c) =>
      c.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nroPedido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(c.id).includes(busqueda.toLowerCase()) ||
      c.fecha.includes(busqueda)
  );

  // ✅ Eliminación completamente funcional
  const handleEliminar = (id: number) => {
    Modal.confirm({
      title: "¿Desea eliminar este comprobante?",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: () => {
        const nuevos = comprobantes.filter((c) => c.id !== id);
        setComprobantes(nuevos);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nuevos));
        message.success("Comprobante eliminado correctamente");
      },
    });
  };

  const handleNuevo = () => {
    setEditingComprobante(null);
    setIsViewingComprobante(false);
    form.resetFields();
    setShowFormModal(true);
  };

  useEffect(() => {
    if (abrirNuevo) {
      handleNuevo();
    }
  }, [abrirNuevo]);

  const handleModificar = (id: number) => {
    const comprobante = comprobantes.find((c) => c.id === id);
    if (comprobante) {
      setEditingComprobante(comprobante);
      setIsViewingComprobante(false);
      form.setFieldsValue({
        ...comprobante,
        clienteDatos: comprobante.clienteDatos ?? clientes.find((cliente) => cliente.nombre === comprobante.cliente),
      });
      setShowFormModal(true);
    }
  };

  const handleVer = (comprobante: Comprobante) => {
    setEditingComprobante(comprobante);
    setIsViewingComprobante(true);
    form.setFieldsValue({
      ...comprobante,
      clienteDatos: comprobante.clienteDatos ?? clientes.find((cliente) => cliente.nombre === comprobante.cliente),
    });
    setShowFormModal(true);
  };

  const handleSubmit = (values: any) => {
    const clienteDatos =
      clientes.find((cliente) => cliente.nombre === values.cliente) ??
      (editingComprobante && editingComprobante.cliente === values.cliente
        ? editingComprobante.clienteDatos
        : undefined);

    if (editingComprobante) {
      const updated = comprobantes.map((c) =>
        c.id === editingComprobante.id
          ? {
              ...editingComprobante,
              ...values,
              clienteDatos,
            }
          : c
      );
      setComprobantes(updated);
      message.success("Comprobante actualizado correctamente");
    } else {
      const id = getNextId(comprobantes);
      const newComprobante: Comprobante = {
        id,
        ...values,
        nroPedido: String(id),
        clienteDatos,
      };
      setComprobantes([...comprobantes, newComprobante]);
      message.success("Comprobante agregado exitosamente");
    }

    setShowFormModal(false);
    form.resetFields();
    setEditingComprobante(null);
  };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      sorter: textSorter((comprobante: Comprobante) => comprobante.fecha),
    },
    {
      title: "N.° Comprobante",
      dataIndex: "nroPedido",
      key: "nroPedido",
      sorter: numberSorter((comprobante: Comprobante) => comprobante.id),
      render: (_: string | undefined, comprobante: Comprobante) => comprobante.id,
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
      sorter: textSorter((comprobante: Comprobante) => comprobante.cliente),
    },
    {
      title: "Productos",
      dataIndex: "productos",
      key: "productos",
      sorter: textSorter((comprobante: Comprobante) =>
        comprobante.productos.map(producto => producto.nombre).join(", ")
      ),
      render: (productos: Producto[]) => (
        <div>
          {productos.map((prod, idx) => (
            <div key={idx}>
              {prod.nombre} (x{prod.cantidad}) - ${prod.precio}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Precio Total",
      dataIndex: "productos",
      key: "precioTotal",
      sorter: numberSorter((comprobante: Comprobante) => calcularTotal(comprobante.productos)),
      render: (productos: Producto[]) => `$${calcularTotal(productos)}`,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, comprobante: Comprobante) => (
        <Space>
          <Button type="link" onClick={() => handleVer(comprobante)}>
            Ver
          </Button>
          <Button type="link" onClick={() => handleModificar(comprobante.id)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleEliminar(comprobante.id)}>
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <PageHeader title="Comprobantes de Venta" />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <Button type="primary" onClick={handleNuevo} style={{ marginRight: 8 }}>
            Nuevo Comprobante
          </Button>
        </div>
        <Input.Search
          placeholder="Buscar por cliente, número o fecha"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={comprobantesFiltrados} rowKey="id" bordered style={{ width: "100%" }} pagination={{ pageSize: 10 }} />

      <Modal
        title={null}
        className="sales-receipt-modal"
        open={showFormModal}
        onCancel={() => {
          setShowFormModal(false);
          setEditingComprobante(null);
          setIsViewingComprobante(false);
          form.resetFields();
        }}
        footer={null}
        width={960}
      >
        <Form
          form={form}
          layout="vertical"
          className="sales-receipt-form"
          onFinish={handleSubmit}
        >
          <div className="sales-receipt">
            <header className="sales-receipt-header">
              <div>
                <div className="sales-receipt-company">Fábrica de Pastas</div>
                <div className="sales-receipt-subtitle">Comprobante de venta</div>
              </div>
              <div className="sales-receipt-heading">
                <h2>Comprobante</h2>
                <div className="sales-receipt-reference">
                  <div className="sales-receipt-number">
                    <strong>N.° de comprobante</strong>
                    <span>{editingComprobante ? editingComprobante.id : "Se asignará al guardar"}</span>
                  </div>
                  <Form.Item
                    name="fecha"
                    label="Fecha"
                    rules={[{ required: true, message: "Ingrese la fecha" }]}
                  >
                    <Input type="date" disabled={isViewingComprobante} />
                  </Form.Item>
                </div>
              </div>
            </header>

            <section className="sales-receipt-parties">
              <div>
                <h3>Facturar a</h3>
                <Form.Item
                  name="cliente"
                  rules={[{ required: true, message: "Seleccione el cliente" }]}
                >
                  <Select
                    placeholder="Seleccione un cliente"
                    showSearch
                    optionFilterProp="label"
                    disabled={isViewingComprobante}
                  >
                    {clientes.map((cliente) => (
                      <Option key={cliente.id} value={cliente.nombre} label={cliente.nombre}>
                        {cliente.nombre}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="sales-receipt-client-data">
                <strong>Datos del cliente <span>(solo lectura)</span></strong>
                {clienteSeleccionado ? (
                  <div className="sales-receipt-client-grid">
                    <div><span>Nombre</span><b>{clienteSeleccionado.nombre || "—"}</b></div>
                    <div><span>Tipo de cliente</span><b>{clienteSeleccionado.tipoCliente || "—"}</b></div>
                    {clienteSeleccionado.nombreComercio && (
                      <div><span>Nombre del comercio</span><b>{clienteSeleccionado.nombreComercio}</b></div>
                    )}
                    {clienteSeleccionado.segmentoComercial && (
                      <div><span>Segmento comercial</span><b>{clienteSeleccionado.segmentoComercial}</b></div>
                    )}
                    <div><span>DNI</span><b>{clienteSeleccionado.dni || "—"}</b></div>
                    <div><span>CUIT</span><b>{clienteSeleccionado.cuit || "—"}</b></div>
                    <div><span>Teléfono</span><b>{clienteSeleccionado.telefono || "—"}</b></div>
                    <div><span>Email</span><b>{clienteSeleccionado.email || "—"}</b></div>
                    <div><span>Dirección</span><b>{clienteSeleccionado.direccion || "—"}</b></div>
                    <div><span>Ciudad</span><b>{clienteSeleccionado.ciudad || "—"}</b></div>
                    <div><span>Provincia</span><b>{clienteSeleccionado.provincia || "—"}</b></div>
                    {clienteSeleccionado.condicionPago && (
                      <div><span>Condición de pago</span><b>{clienteSeleccionado.condicionPago}</b></div>
                    )}
                  </div>
                ) : (
                  <span className="sales-receipt-client-placeholder">Seleccione un cliente para ver sus datos</span>
                )}
              </div>
            </section>

            <section className="sales-receipt-items">
              <h3>Detalle de productos</h3>
              <div className="sales-receipt-table">
                <div className={`sales-receipt-table-header${isViewingComprobante ? " is-viewing" : ""}`}>
                  <span>Cantidad</span>
                  <span>Descripción</span>
                  <span>Precio unitario</span>
                  <span>Monto</span>
                  {!isViewingComprobante && <span aria-label="Acciones" />}
                </div>
                <Form.List name="productos">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => {
                        const item = watchedProductos[name];
                        const amount = (Number(item?.cantidad) || 0) * (Number(item?.precio) || 0);
                        return (
                          <div className={`sales-receipt-item-row${isViewingComprobante ? " is-viewing" : ""}`} key={key}>
                            <Form.Item
                              {...restField}
                              name={[name, "cantidad"]}
                              rules={[{ required: true, message: "Ingrese cantidad" }]}
                            >
                              <InputNumber
                                aria-label="Cantidad"
                                placeholder="0"
                                min={1}
                                disabled={isViewingComprobante}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "nombre"]}
                              rules={[{ required: true, message: "Seleccione el producto" }]}
                            >
                              <Select
                                aria-label="Descripción"
                                placeholder="Seleccione un producto"
                                showSearch
                                optionFilterProp="label"
                                disabled={isViewingComprobante}
                                onChange={(nombre) => {
                                  const producto = productos.find((item) => item.nombre === nombre);
                                  form.setFieldValue(["productos", name, "id"], producto?.id);
                                  form.setFieldValue(["productos", name, "precio"], producto?.precio ?? 0);
                                }}
                              >
                                {productos.map((producto) => (
                                  <Option key={producto.id} value={producto.nombre} label={producto.nombre}>
                                    {producto.nombre}
                                  </Option>
                                ))}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, "precio"]}
                              rules={[{ required: true, message: "Ingrese precio" }]}
                            >
                              <InputNumber
                                aria-label="Precio unitario"
                                placeholder="$ 0,00"
                                min={0}
                                disabled={isViewingComprobante}
                              />
                            </Form.Item>
                            <div className="sales-receipt-line-total">{formatCurrency(amount)}</div>
                            <Form.Item {...restField} name={[name, "id"]} hidden>
                              <Input />
                            </Form.Item>
                            {!isViewingComprobante && (
                              <Button type="link" danger onClick={() => remove(name)}>
                                Quitar
                              </Button>
                            )}
                          </div>
                        );
                      })}
                      {!isViewingComprobante && (
                        <Button type="dashed" onClick={() => add({ nombre: "", cantidad: 1, precio: 0 })} block>
                          Agregar producto
                        </Button>
                      )}
                    </>
                  )}
                </Form.List>
              </div>
            </section>

            <section className="sales-receipt-total">
              <span>Subtotal</span>
              <strong>{formatCurrency(totalComprobante)}</strong>
              <span className="sales-receipt-grand-label">Total</span>
              <strong className="sales-receipt-grand-total">{formatCurrency(totalComprobante)}</strong>
            </section>

            <footer className="sales-receipt-footer">
              <strong>¡Gracias por su compra!</strong>
              <span>Conserve este comprobante para cualquier consulta sobre su pedido.</span>
            </footer>

            <div className="sales-receipt-actions">
              {isViewingComprobante ? (
                <Button onClick={() => setShowFormModal(false)}>Cerrar</Button>
              ) : (
                <>
                  <Button onClick={() => setShowFormModal(false)}>Cancelar</Button>
                  <Button type="primary" htmlType="submit">
                    {editingComprobante ? "Guardar cambios" : "Crear comprobante"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ComprobantesVentaPage;
