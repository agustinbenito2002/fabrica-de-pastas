import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message
} from "antd";
import dayjs from "dayjs";
import { PageHeader } from "../components/PageHeader";
import { textSorter } from "../utils/tableSort";
import { getNextId } from "../utils/recordIds";

const { Option } = Select;
const LOCAL_STORAGE_KEY = "maquinas-listado";

type MaquinaRecord = {
  key: string;
  id: number;
  tipo: string;
  estado: string;
  fechaMantenimiento: string;
  tipoMantenimiento: string; // 🆕 Nuevo campo
  responsable: string;
};

const initialData: MaquinaRecord[] = [
  {
    key: "1",
    id: 1,
    tipo: "Amasadora",
    estado: "Operativa",
    fechaMantenimiento: "2025-09-15",
    tipoMantenimiento: "Preventivo",
    responsable: "Juan Pérez"
  },
  {
    key: "2",
    id: 2,
    tipo: "Cortadora",
    estado: "En reparación",
    fechaMantenimiento: "2025-08-30",
    tipoMantenimiento: "Correctivo",
    responsable: "Ana Gómez"
  },
  {
    key: "3",
    id: 3,
    tipo: "Empaquetadora",
    estado: "Operativa",
    fechaMantenimiento: "2025-09-10",
    tipoMantenimiento: "Lubricación",
    responsable: "Carlos Ruiz"
  }
];

export default function MaquinasPage() {
  const [data, setData] = useState<MaquinaRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<MaquinaRecord | null>(null);
  const [form] = Form.useForm();
  const [busqueda, setBusqueda] = useState("");
  const maquinasFiltradas = data.filter((maquina) => {
    const q = busqueda.trim().toLowerCase();
    return !q || [
      String(maquina.id),
      maquina.tipo,
      maquina.estado,
      maquina.fechaMantenimiento,
      maquina.tipoMantenimiento,
      maquina.responsable,
    ].some(value => value.toLowerCase().includes(q));
  });

  // 🧠 Guardar automáticamente en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // ➕ Abrir modal para agregar una máquina
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  // ✏️ Editar máquina
  const handleEdit = (record: MaquinaRecord) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      fechaMantenimiento: record.fechaMantenimiento
        ? dayjs(record.fechaMantenimiento)
        : null
    });
    setModalVisible(true);
  };

  // 💾 Guardar cambios
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const nuevaFecha = values.fechaMantenimiento
        ? values.fechaMantenimiento.format("YYYY-MM-DD")
        : "";

      if (editing) {
        // ✅ Editar
        const actualizada = data.map(item =>
          item.key === editing.key
            ? { ...values, key: editing.key, id: editing.id, fechaMantenimiento: nuevaFecha }
            : item
        );
        setData(actualizada);
        message.success("Máquina modificada correctamente");
      } else {
        const nueva: MaquinaRecord = {
          key: Date.now().toString(),
          id: getNextId(data),
          tipo: values.tipo,
          estado: values.estado,
          fechaMantenimiento: nuevaFecha,
          tipoMantenimiento: values.tipoMantenimiento,
          responsable: values.responsable
        };

        setData([...data, nueva]);
        message.success("Máquina registrada correctamente");
      }

      setModalVisible(false);
      form.resetFields();
      setEditing(null);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  // 🗑️ Eliminar
  const handleDelete = (record: MaquinaRecord) => {
    Modal.confirm({
      title: "¿Eliminar máquina?",
      content: `Se eliminará la máquina ${record.id}`,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: () => {
        setData(data.filter(item => item.key !== record.key));
        message.success("Máquina eliminada");
      }
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", sorter: (a: MaquinaRecord, b: MaquinaRecord) => a.id - b.id },
    { title: "Tipo", dataIndex: "tipo", key: "tipo", sorter: textSorter((maquina: MaquinaRecord) => maquina.tipo) },
    { title: "Estado", dataIndex: "estado", key: "estado", sorter: textSorter((maquina: MaquinaRecord) => maquina.estado) },
    {
      title: "Último Mantenimiento",
      key: "fechaMantenimiento",
      sorter: textSorter((maquina: MaquinaRecord) => `${maquina.fechaMantenimiento} ${maquina.tipoMantenimiento}`),
      render: (_: any, record: MaquinaRecord) => (
        <span>
          {record.fechaMantenimiento
            ? `${dayjs(record.fechaMantenimiento).format("YYYY-MM-DD")} (${record.tipoMantenimiento})`
            : "—"}
        </span>
      )
    },
    { title: "Responsable", dataIndex: "responsable", key: "responsable", sorter: textSorter((maquina: MaquinaRecord) => maquina.responsable) },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: MaquinaRecord) => (
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
      <PageHeader title="Listado de Máquinas" />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          Registrar máquina
        </Button>
        <Input.Search
          placeholder="Buscar por ID, tipo, estado, mantenimiento o responsable"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={maquinasFiltradas} pagination={false} rowKey="key" bordered />

      <Modal
        title={editing ? "Editar máquina" : "Registrar máquina"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={handleSave}
        okText="Guardar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tipo"
            name="tipo"
            rules={[{ required: true, message: "Ingrese el tipo" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Estado"
            name="estado"
            rules={[{ required: true, message: "Seleccione el estado" }]}
          >
            <Select>
              <Option value="Operativa">Operativa</Option>
              <Option value="En reparación">En reparación</Option>
              <Option value="Fuera de servicio">Fuera de servicio</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Fecha del Último Mantenimiento"
            name="fechaMantenimiento"
            rules={[{ required: true, message: "Seleccione la fecha" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="Tipo de Mantenimiento"
            name="tipoMantenimiento"
            rules={[{ required: true, message: "Seleccione el tipo de mantenimiento" }]}
          >
            <Select placeholder="Seleccione un tipo">
              <Option value="Preventivo">Preventivo</Option>
              <Option value="Correctivo">Correctivo</Option>
              <Option value="Lubricación">Lubricación</Option>
              <Option value="Calibración">Calibración</Option>
              <Option value="Limpieza">Limpieza</Option>
              <Option value="Otro">Otro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Responsable"
            name="responsable"
            rules={[{ required: true, message: "Ingrese el responsable" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
