import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Space,
  InputNumber,
  Select
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const LOCAL_STORAGE_KEY = "presupuestos-listado";

interface PresupuestoItem {
  descripcion: string;
  cantidad: number;
  precio: number;
}

interface Presupuesto {
  id: number;
  proveedor: string;           // nuevo: proveedor
  fecha: string;
  descripcion: string;
  items: PresupuestoItem[];
  cantidad: number;           // nuevo: cantidad total (unidades)
  total: number;
  estado: "Pendiente" | "Aprobado" | "Rechazado" | "Expirado";
}

const initialData: Presupuesto[] = [
  {
    id: 1,
    proveedor: "Proveedor A",
    fecha: "2025-10-30",
    descripcion: "Presupuesto para evento",
    items: [
      { descripcion: "Fideos", cantidad: 10, precio: 500 },
      { descripcion: "Ravioles", cantidad: 5, precio: 600 }
    ],
    cantidad: 15,
    total: 10 * 500 + 5 * 600,
    estado: "Aprobado"
  }
];

const PresupuestoPages: React.FC = () => {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
    return saved ? JSON.parse(saved) : initialData;
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Presupuesto | null>(null);
  const [form] = Form.useForm();
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(presupuestos));
    }
  }, [presupuestos]);

  const presupuestosFiltrados = presupuestos.filter((p) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      p.proveedor.toLowerCase().includes(q) ||
      p.estado.toLowerCase().includes(q) ||
      p.fecha.includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Presupuesto) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      fecha: dayjs(record.fecha)
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const nuevaFecha = values.fecha.format("YYYY-MM-DD");
      const items: PresupuestoItem[] = values.items || [];
      const total = items.reduce((sum: number, item: any) => sum + item.cantidad * item.precio, 0);
      const cantidad = values.cantidad ?? items.reduce((s: number, it: any) => s + (it.cantidad || 0), 0);

      if (editing) {
        const actualizados = presupuestos.map(p =>
          p.id === editing.id ? { ...values, id: editing.id, fecha: nuevaFecha, total, cantidad } : p
        );
        setPresupuestos(actualizados);
        message.success("Presupuesto modificado correctamente");
      } else {
        const nuevo: Presupuesto = {
          ...values,
          id: Date.now(),
          fecha: nuevaFecha,
          total,
          cantidad
        };
        setPresupuestos([...presupuestos, nuevo]);
        message.success("Presupuesto registrado correctamente");
      }

      setModalVisible(false);
      form.resetFields();
      setEditing(null);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleDelete = (record: Presupuesto) => {
    Modal.confirm({
      title: "¿Eliminar presupuesto?",
      content: `Se eliminará el presupuesto #${record.id}`,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: () => {
        setPresupuestos(presupuestos.filter(item => item.id !== record.id));
        message.success("Presupuesto eliminado");
      }
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Proveedor", dataIndex: "proveedor", key: "proveedor" },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD")
    },
    { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
    { title: "Cantidad", dataIndex: "cantidad", key: "cantidad" },
    { title: "Estado", dataIndex: "estado", key: "estado" },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `$${Number(total).toFixed(2)}`
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: Presupuesto) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            Eliminar
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>Presupuestos</h2>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>
          Nuevo Presupuesto
        </Button>
        <Input.Search
          placeholder="Buscar por proveedor, estado, fecha o descripción"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={presupuestosFiltrados} rowKey="id" />

      <Modal
        title={editing ? "Editar Presupuesto" : "Nuevo Presupuesto"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={handleSave}
        okText="Guardar"
        cancelText="Cancelar"
        width={900}
      >
        <Form form={form} layout="vertical" initialValues={{ items: [] }}>
          <Form.Item
            name="proveedor"
            label="Proveedor"
            rules={[{ required: true, message: "Ingrese el proveedor" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="fecha"
            label="Fecha"
            rules={[{ required: true, message: "Seleccione la fecha" }]}
          >
            <DatePicker format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[{ required: true, message: "Ingrese la descripción" }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="cantidad"
            label="Cantidad (unidades)"
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: "Seleccione el estado" }]}
          >
            <Select>
              <Option value="Pendiente">Pendiente</Option>
              <Option value="Aprobado">Aprobado</Option>
              <Option value="Rechazado">Rechazado</Option>
              <Option value="Expirado">Expirado</Option>
            </Select>
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, "descripcion"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <Input placeholder="Descripción" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "cantidad"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <InputNumber placeholder="Cantidad" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "precio"]}
                      rules={[{ required: true, message: "Requerido" }]}
                    >
                      <InputNumber placeholder="Precio" min={0} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} type="link" danger>
                      Eliminar
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Agregar Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default PresupuestoPages;