import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";

type Materia = {
  key: string;
  id: string;
  nombre: string;
  cantidad: number;
};

const LOCAL_STORAGE_KEY = "materias-listado";

const initialData: Materia[] = [
  { key: "1", id: "MP-001", nombre: "Harina", cantidad: 1000 },
  { key: "2", id: "MP-002", nombre: "Huevos", cantidad: 200 },
  { key: "3", id: "MP-003", nombre: "Sal", cantidad: 50 },
];

export default function MateriasPage() {
  const [data, setData] = useState<Materia[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);
  const [form] = Form.useForm();

  // modal rápido para cantidad
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmForm] = Form.useForm();
  const [selected, setSelected] = useState<Materia | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleSelect = (record: Materia) => {
    setSelected(record);
    confirmForm.setFieldsValue({ cantidad: record.cantidad });
    setConfirmVisible(true);
  };

  const confirmSave = async () => {
    try {
      const values = await confirmForm.validateFields();
      if (selected) {
        setData(prev => prev.map(m => (m.key === selected.key ? { ...m, cantidad: Number(values.cantidad) } : m)));
        message.success("Cantidad actualizada");
      }
      setConfirmVisible(false);
      confirmForm.resetFields();
      setSelected(null);
    } catch {
      // validación
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        setData(prev => prev.map(m => (m.key === editing.key ? { ...m, nombre: values.nombre, cantidad: Number(values.cantidad) } : m)));
        message.success("Materia modificada");
      } else {
        if (data.some(d => d.id === values.id)) {
          message.error("El ID ya existe");
          return;
        }
        const nueva: Materia = { key: Date.now().toString(), id: values.id, nombre: values.nombre, cantidad: Number(values.cantidad) };
        setData(prev => [...prev, nueva]);
        message.success("Materia registrada");
      }
      setModalVisible(false);
      form.resetFields();
      setEditing(null);
    } catch {
      // validación
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
  ];

  return (
    <div>
      <h2>Listado de Materias Primas</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button type="primary" onClick={handleAdd}>Registrar materia prima</Button>
        <Button onClick={() => {
          const csv = ["ID,Nombre,Cantidad", ...data.map(d => `${d.id},${d.nombre},${d.cantidad}`)].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "materias_primas.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}>Exportar CSV</Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleSelect(record),
          style: { cursor: "pointer" }
        })}
      />

      {/* Modal rápido para actualizar cantidad */}
      <Modal
        title={selected ? `Actualizar cantidad: ${selected.nombre}` : "Actualizar cantidad"}
        open={confirmVisible}
        onCancel={() => { setConfirmVisible(false); confirmForm.resetFields(); setSelected(null); }}
        onOk={confirmSave}
        okText="Actualizar"
      >
        <Form form={confirmForm} layout="vertical">
          <Form.Item name="cantidad" label="Cantidad" rules={[{ required: true, message: "Ingrese la cantidad" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para registrar/editar materia */}
      <Modal
        title={editing ? "Editar materia prima" : "Registrar materia prima"}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); setEditing(null); }}
        onOk={handleSave}
        okText="Guardar"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="ID" name="id" rules={[{ required: true, message: "Ingrese ID" }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: "Ingrese nombre" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Cantidad" name="cantidad" rules={[{ required: true, message: "Ingrese cantidad" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}