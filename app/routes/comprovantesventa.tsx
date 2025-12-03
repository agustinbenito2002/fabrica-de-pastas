import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, InputNumber, Space, message, Table } from "antd";

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
    productos: [{ nombre: "Tallarines", cantidad: 3, precio: 90 }],
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

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingComprobante, setEditingComprobante] = useState<Comprobante | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [form] = Form.useForm();

  // Guardar cambios automáticamente
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(comprobantes));
  }, [comprobantes]);

  const comprobantesFiltrados = comprobantes.filter(
    (c) =>
      c.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.nroPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.fecha.includes(busqueda)
  );

  // ✅ Eliminación completamente funcional
  const handleEliminar = (id: number) => {
    if (window.confirm("¿Desea eliminar este comprobante?")) {
      const nuevos = comprobantes.filter((c) => c.id !== id);
      setComprobantes(nuevos);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nuevos));
      message.success("Comprobante eliminado correctamente");
    }
  };

  const handleNuevo = () => {
    setEditingComprobante(null);
    form.resetFields();
    setShowFormModal(true);
  };

  const handleModificar = (id: number) => {
    const comprobante = comprobantes.find((c) => c.id === id);
    if (comprobante) {
      setEditingComprobante(comprobante);
      form.setFieldsValue(comprobante);
      setShowFormModal(true);
    }
  };

  const handleSubmit = (values: any) => {
    if (editingComprobante) {
      const updated = comprobantes.map((c) =>
        c.id === editingComprobante.id ? { ...editingComprobante, ...values } : c
      );
      setComprobantes(updated);
      message.success("Comprobante actualizado correctamente");
    } else {
      const newComprobante: Comprobante = {
        id: comprobantes.length ? comprobantes[comprobantes.length - 1].id + 1 : 1,
        ...values,
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
    },
    {
      title: "Nro Pedido",
      dataIndex: "nroPedido",
      key: "nroPedido",
    },
    {
      title: "Cliente",
      dataIndex: "cliente",
      key: "cliente",
    },
    {
      title: "Productos",
      dataIndex: "productos",
      key: "productos",
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
      render: (productos: Producto[]) => `$${calcularTotal(productos)}`,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, comprobante: Comprobante) => (
        <div>
          <Button
            type="primary"
            onClick={() => handleModificar(comprobante.id)}
            style={{ marginRight: 8 }}
          >
            Editar
          </Button>
          <Button danger onClick={() => handleEliminar(comprobante.id)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <h2>Comprobantes de Venta</h2>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <Button type="primary" onClick={handleNuevo} style={{ marginRight: 8 }}>
            Nuevo Comprobante
          </Button>
        </div>
        <Input.Search
          placeholder="Buscar por cliente, número, fecha o producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={comprobantesFiltrados} rowKey="id" style={{ width: "100%" }} pagination={{ pageSize: 10 }} />

      {/* Modal de agregar o editar comprobante */}
      <Modal
        title={editingComprobante ? "Editar Comprobante" : "Registrar Comprobante"}
        open={showFormModal}
        onCancel={() => {
          setShowFormModal(false);
          setEditingComprobante(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="fecha"
            label="Fecha"
            rules={[{ required: true, message: "Ingrese la fecha" }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="nroPedido"
            label="Número de Pedido"
            rules={[{ required: true, message: "Ingrese el número de pedido" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="cliente"
            label="Cliente"
            rules={[{ required: true, message: "Ingrese el nombre del cliente" }]}
          >
            <Input />
          </Form.Item>

          <Form.List name="productos">
            {(fields, { add, remove }) => (
              <>
                <label><strong>Productos</strong></label>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, "nombre"]}
                      rules={[{ required: true, message: "Ingrese nombre del producto" }]}
                    >
                      <Input placeholder="Producto" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "cantidad"]}
                      rules={[{ required: true, message: "Ingrese cantidad" }]}
                    >
                      <InputNumber placeholder="Cantidad" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "precio"]}
                      rules={[{ required: true, message: "Ingrese precio" }]}
                    >
                      <InputNumber placeholder="Precio" min={0} />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)}>
                      Eliminar
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Agregar Producto
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingComprobante ? "Guardar Cambios" : "Crear Comprobante"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ComprobantesVentaPage;
