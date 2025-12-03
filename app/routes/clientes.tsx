import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Switch, message } from "antd";
import type { ColumnsType } from "antd/es/table";

const LOCAL_STORAGE_KEY = "clientes-listado";

function getInitialClientes() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return [
    {
      id: 1,
      nombre: "Juan Pérez",
      email: "juan@example.com",
      telefono: "1122334455",
      direccion: "Calle 1",
      estadoDeuda: false,
      deuda: 0,
      dni: "12345678",
      cuit: "20-12345678-9",
    },
    {
      id: 2,
      nombre: "María Gómez",
      email: "maria@example.com",
      telefono: "1199887766",
      direccion: "Calle 2",
      estadoDeuda: true,
      deuda: 5000,
      dni: "23456789",
      cuit: "27-23456789-3",
    },
    {
      id: 3,
      nombre: "Carlos López",
      email: "carlos@example.com",
      telefono: "1144556677",
      direccion: "Calle 3",
      estadoDeuda: false,
      deuda: 0,
      dni: "34567890",
      cuit: "23-34567890-1",
    },
  ];
}

type Cliente = {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estadoDeuda: boolean;
  deuda: number;
  dni: string;
  cuit: string;
};

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>(getInitialClientes());
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  // <-- ADICIÓN: buscador -->
  const [busqueda, setBusqueda] = useState("");
  const clientesFiltrados = clientes.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      String(c.id).toLowerCase().includes(q) ||
      (c.dni && c.dni.toLowerCase().includes(q)) ||
      (c.nombre && c.nombre.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (values: any) => {
    if (editingId) {
      // Editar cliente existente
      const updatedClientes = clientes.map((cliente) =>
        cliente.id === editingId ? { ...values, id: editingId } : cliente
      );
      setClientes(updatedClientes);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedClientes));
      message.success("Cliente actualizado exitosamente");
    } else {
      // Crear nuevo cliente
      const newCliente = {
        ...values,
        id: clientes.length + 1,
        estadoDeuda: values.estadoDeuda || false,
        deuda: values.deuda || 0,
      };
      const newClientes = [...clientes, newCliente];
      setClientes(newClientes);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newClientes));
      message.success("Cliente creado exitosamente");
    }
    setModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleEliminar = (id: number) => {
    if (window.confirm("¿Desea eliminar este cliente?")) {
      const nuevos = clientes.filter((c) => c.id !== id);
      setClientes(nuevos);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nuevos));
      message.success("Cliente eliminado correctamente");
    }
  };

  const columns: ColumnsType<Cliente> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "DNI", dataIndex: "dni", key: "dni" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "telefono", key: "telefono" },
    { title: "Dirección", dataIndex: "direccion", key: "direccion" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: Cliente) => (
        <span>
          <Button
            type="link"
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleEliminar(record.id)}>
            Eliminar
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <h2>Administración de Clientes</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Button
          type="primary"
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Nuevo Cliente
        </Button>

        {/* <-- ADICIÓN: Input.Search para clientes --> */}
        <Input.Search
          placeholder="Buscar por ID, DNI o nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={clientesFiltrados}
        rowKey="id"
        style={{ width: "100%" }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Editar Cliente" : "Nuevo Cliente"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="dni"
            label="DNI"
            rules={[
              { required: true, message: "El DNI es obligatorio" },
              { pattern: /^\d{8}$/, message: "El DNI debe tener 8 dígitos" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="cuit"
            label="CUIT"
            rules={[
              { required: true, message: "El CUIT es obligatorio" },
              {
                pattern: /^\d{2}-\d{8}-\d{1}$/,
                message: "Formato válido: XX-XXXXXXXX-X",
              },
            ]}
          >
            <Input placeholder="Ej: 20-12345678-9" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: "El nombre es obligatorio" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "El email es obligatorio" },
              { type: "email", message: "Ingrese un email válido" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="telefono" label="Teléfono">
            <Input />
          </Form.Item>

          <Form.Item name="direccion" label="Dirección">
            <Input />
          </Form.Item>

          <Form.Item
            name="estadoDeuda"
            label="Estado de Deuda"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="deuda" label="Deuda">
            <Input type="number" prefix="$" min={0} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingId ? "Actualizar" : "Crear"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientesPage;
