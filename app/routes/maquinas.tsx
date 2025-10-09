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

const { Option } = Select;
const LOCAL_STORAGE_KEY = "maquinas-listado";

type MaquinaRecord = {
  key: string;
  id: string;
  tipo: string;
  estado: string;
  fechaMantenimiento: string;
  responsable: string;
};

const initialData: MaquinaRecord[] = [
  {
    key: "1",
    id: "M-001",
    tipo: "Amasadora",
    estado: "Operativa",
    fechaMantenimiento: "2025-09-15",
    responsable: "Juan Pérez"
  },
  {
    key: "2",
    id: "M-002",
    tipo: "Cortadora",
    estado: "En reparación",
    fechaMantenimiento: "2025-08-30",
    responsable: "Ana Gómez"
  },
  {
    key: "3",
    id: "M-003",
    tipo: "Empaquetadora",
    estado: "Operativa",
    fechaMantenimiento: "2025-09-10",
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

  // 🧠 Guardar automáticamente los datos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // ➕ Abrir modal para agregar una nueva máquina
  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  // ✏️ Abrir modal para editar una máquina
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

  // 💾 Guardar (agregar o editar)
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const nuevaFecha = values.fechaMantenimiento
        ? values.fechaMantenimiento.format("YYYY-MM-DD")
        : "";

      if (editing) {
        // ✅ Editar una existente
        const actualizada = data.map(item =>
          item.key === editing.key
            ? { ...values, key: editing.key, fechaMantenimiento: nuevaFecha }
            : item
        );
        setData(actualizada);
        message.success("Máquina modificada correctamente");
      } else {
        // ✅ Agregar una nueva
        if (data.some(item => item.id === values.id)) {
          message.error("El ID ya existe. Ingrese uno diferente.");
          return;
        }

        const nueva: MaquinaRecord = {
          key: Date.now().toString(),
          id: values.id,
          tipo: values.tipo,
          estado: values.estado,
          fechaMantenimiento: nuevaFecha,
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

  // 🗑️ Eliminar máquina
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
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Estado", dataIndex: "estado", key: "estado" },
    {
      title: "Fecha Último Mantenimiento",
      dataIndex: "fechaMantenimiento",
      key: "fechaMantenimiento",
      render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD") : "")
    },
    { title: "Responsable", dataIndex: "responsable", key: "responsable" },
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
      <h2>Listado de Máquinas</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Registrar máquina
      </Button>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
      />

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
            label="ID"
            name="id"
            rules={[{ required: true, message: "Ingrese el ID" }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>

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
            label="Fecha Último Mantenimiento"
            name="fechaMantenimiento"
            rules={[{ required: true, message: "Seleccione la fecha" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
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
