import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "../components/PageHeader";

type Materia = {
  key: string;
  id: string;
  nombre: string;
  rubro: string;
  cantidad: number;
};

type MateriaGuardada = Omit<Materia, "rubro"> & Partial<Pick<Materia, "rubro">>;

const LOCAL_STORAGE_KEY = "materias-listado";

const initialData: Materia[] = [
  { key: "1", id: "MP-001", nombre: "Harina", rubro: "Secos", cantidad: 1000 },
  { key: "2", id: "MP-002", nombre: "Huevos", rubro: "Refrigerados", cantidad: 200 },
  { key: "3", id: "MP-003", nombre: "Sal", rubro: "Condimentos", cantidad: 50 },
];

export default function MateriasPage() {
  const [data, setData] = useState<Materia[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return initialData;

    const savedData: MateriaGuardada[] = JSON.parse(saved);
    return savedData.map(item => ({ ...item, rubro: item.rubro ?? "" }));
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

  const handleEdit = (record: Materia) => {
    setEditing(record);
    form.setFieldsValue(record);
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
        setData(prev => prev.map(m => (m.key === editing.key ? { ...m, nombre: values.nombre, rubro: values.rubro, cantidad: Number(values.cantidad) } : m)));
        message.success("Insumo modificado");
      } else {
        if (data.some(d => d.id === values.id)) {
          message.error("El ID ya existe");
          return;
        }
        const nueva: Materia = { key: Date.now().toString(), id: values.id, nombre: values.nombre, rubro: values.rubro, cantidad: Number(values.cantidad) };
        setData(prev => [...prev, nueva]);
        message.success("Insumo registrado");
      }
      setModalVisible(false);
      form.resetFields();
      setEditing(null);
    } catch {
      // validación
    }
  };

  const columns: ColumnsType<Materia> = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Rubro", dataIndex: "rubro", key: "rubro", render: rubro => rubro || "—" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Materia) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          Editar
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <PageHeader title="Insumos" />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>Nuevo Insumo</Button>
        {/* opcional: buscador aquí */}
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" bordered style={{ width: "100%" }} scroll={{ x: "max-content" }} pagination={{ pageSize: 10 }} />

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

      {/* Modal para registrar/editar insumo */}
      <Modal
        title={editing ? "Editar insumo" : "Registrar insumo"}
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
          <Form.Item label="Rubro" name="rubro" rules={[{ required: true, message: "Ingrese rubro" }]}>
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