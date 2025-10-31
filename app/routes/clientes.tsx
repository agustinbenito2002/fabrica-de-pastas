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
    { title: "CUIT", dataIndex: "cuit", key: "cuit" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "telefono", key: "telefono" },
    { title: "Dirección", dataIndex: "direccion", key: "direccion" },
    {
      title: "Estado Deuda",
      dataIndex: "estadoDeuda",
      key: "estadoDeuda",
      render: (text, record) => (
        <span>
          {record.estadoDeuda ? (
            <span style={{ color: "red", fontWeight: "bold" }}>Con deuda</span>
          ) : (
            <span style={{ color: "green" }}>Sin deuda</span>
          )}
        </span>
      ),
    },
    {
      title: "Monto",
      dataIndex: "deuda",
      key: "deuda",
      render: (text, record) => (
        <span>
          {record.estadoDeuda ? (
            <>${record.deuda.toFixed(2)}</>
          ) : (
            "$0.00"
          )}
        </span>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
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
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1>Listado de Clientes</h1>

      <Button
        type="primary"
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setModalVisible(true);
        }}
        style={{ marginBottom: 16 }}
      >
        Nuevo Cliente
      </Button>

      <Table columns={columns} dataSource={clientes} rowKey="id" />

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
