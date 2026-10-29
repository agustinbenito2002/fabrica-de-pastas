import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "../components/PageHeader";
import { getRubrosRegistrados } from "../utils/rubros";
import { numberSorter, textSorter } from "../utils/tableSort";
import { getNextId } from "../utils/recordIds";

type Materia = {
  key: string;
  id: number;
  nombre: string;
  rubro: string;
  cantidad: number;
};

type MateriaGuardada = Omit<Materia, "rubro"> & Partial<Pick<Materia, "rubro">>;

const LOCAL_STORAGE_KEY = "materias-listado";

const initialData: Materia[] = [
  { key: "1", id: 1, nombre: "Harina", rubro: "Secos", cantidad: 1000 },
  { key: "2", id: 2, nombre: "Huevos", rubro: "Refrigerados", cantidad: 200 },
  { key: "3", id: 3, nombre: "Sal", rubro: "Condimentos", cantidad: 50 },
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
  const [rubros, setRubros] = useState(getRubrosRegistrados);
  const [busqueda, setBusqueda] = useState("");
  const materiasFiltradas = data.filter((materia) => {
    const q = busqueda.trim().toLowerCase();
    return !q || [String(materia.id), materia.nombre, materia.rubro, String(materia.cantidad)]
      .some(value => value.toLowerCase().includes(q));
  });

  // modal rápido para cantidad
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmForm] = Form.useForm();
  const [selected, setSelected] = useState<Materia | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const actualizarRubros = () => setRubros(getRubrosRegistrados());
    window.addEventListener("storage", actualizarRubros);
    return () => window.removeEventListener("storage", actualizarRubros);
  }, []);

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
        const nueva: Materia = { key: Date.now().toString(), id: getNextId(data), nombre: values.nombre, rubro: values.rubro, cantidad: Number(values.cantidad) };
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
    { title: "ID", dataIndex: "id", key: "id", sorter: numberSorter((materia: Materia) => materia.id) },
    { title: "Nombre", dataIndex: "nombre", key: "nombre", sorter: textSorter((materia: Materia) => materia.nombre) },
    { title: "Rubro", dataIndex: "rubro", key: "rubro", sorter: textSorter((materia: Materia) => materia.rubro), render: rubro => rubro || "—" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad", sorter: numberSorter((materia: Materia) => materia.cantidad) },
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
        <Input.Search
          placeholder="Buscar por ID, nombre, rubro o cantidad"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={materiasFiltradas} rowKey="id" bordered style={{ width: "100%" }} scroll={{ x: "max-content" }} pagination={{ pageSize: 10 }} />

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
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: "Ingrese nombre" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Rubro" name="rubro" rules={[{ required: true, message: "Ingrese rubro" }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Seleccione un rubro"
              options={rubros.map((rubro) => ({ value: rubro, label: rubro }))}
            />
          </Form.Item>
          <Form.Item label="Cantidad" name="cantidad" rules={[{ required: true, message: "Ingrese cantidad" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}