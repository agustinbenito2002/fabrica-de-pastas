import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";

const LOCAL_STORAGE_KEY = "proveedores-listado";

type ProveedorRecord = {
  key: string;
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  cuit: string;
};

const initialData: ProveedorRecord[] = [
  {
    key: "1",
    id: "P-001",
    nombre: "Harinas del Sur S.A.",
    telefono: "1122334455",
    email: "contacto@harinassur.com",
    direccion: "Av. Rivadavia 4567, CABA",
    cuit: "30711222334"
  },
  {
    key: "2",
    id: "P-002",
    nombre: "Pastas Industriales SRL",
    telefono: "1145678901",
    email: "ventas@pastasind.com",
    direccion: "Calle 25 de Mayo 320, Rosario",
    cuit: "30555666777"
  }
];

export default function ProveedoresPage() {
  const [data, setData] = useState<ProveedorRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });

  const [editing, setEditing] = useState<ProveedorRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Guardar en localStorage al cambiar data
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // 🟢 Abrir modal para editar
  const handleEdit = (record: ProveedorRecord) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  // 🟢 Abrir modal para nuevo proveedor
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 🟢 Guardar (nuevo o editado)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        // Editar proveedor
        setData(prev =>
          prev.map(item =>
            item.key === editing.key ? { ...editing, ...values } : item
          )
        );
        message.success("Proveedor modificado correctamente");
      } else {
        // Nuevo proveedor
        if (data.some(item => item.id === values.id)) {
          message.error("El ID ya existe. Ingrese uno diferente.");
          return;
        }

        const newProveedor: ProveedorRecord = {
          key: Date.now().toString(),
          ...values
        };

        setData(prev => [...prev, newProveedor]);
        message.success("Proveedor registrado correctamente");
      }

      setModalVisible(false);
      setEditing(null);
      form.resetFields();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  // 🟢 Eliminar proveedor
  const handleDelete = (record: ProveedorRecord) => {
    Modal.confirm({
      title: "¿Eliminar proveedor?",
      content: `Se eliminará el proveedor ${record.nombre}`,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: () => {
        setData(prev => prev.filter(item => item.key !== record.key));
        message.success("Proveedor eliminado");
      }
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "CUIT", dataIndex: "cuit", key: "cuit" },
    { title: "Teléfono", dataIndex: "telefono", key: "telefono" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Dirección", dataIndex: "direccion", key: "direccion" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: ProveedorRecord) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Eliminar
          </Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Listado de Proveedores</h2>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={handleAdd}
      >
        Registrar proveedor
      </Button>

      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        rowKey="key"
      />

      <Modal
        title={editing ? "Editar proveedor" : "Registrar proveedor"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={handleSave}
        okText="Guardar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ID"
            name="id"
            rules={[{ required: true, message: "Ingrese el ID" }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            label="Nombre"
            name="nombre"
            rules={[{ required: true, message: "Ingrese el nombre" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="CUIT"
            name="cuit"
            rules={[
              { required: true, message: "Ingrese el CUIT" },
              { pattern: /^[0-9]{11}$/, message: "Debe tener 11 dígitos numéricos" }
            ]}
          >
            <Input maxLength={11} />
          </Form.Item>

          <Form.Item
            label="Teléfono"
            name="telefono"
            rules={[
              { required: true, message: "Ingrese el teléfono" },
              { pattern: /^[0-9]+$/, message: "Solo se permiten números" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Ingrese el email" },
              { type: "email", message: "Ingrese un email válido" }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Dirección"
            name="direccion"
            rules={[{ required: true, message: "Ingrese la dirección" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
