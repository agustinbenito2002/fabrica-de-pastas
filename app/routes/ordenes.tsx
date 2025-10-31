import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const LOCAL_STORAGE_KEY = "ordenes-listado";

interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Orden {
  id: number;
  cliente: string;
  fecha: string;
  tipo: "evento" | "regular" | "donacion";
  estado: "Pendiente" | "En Proceso" | "Completada" | "Cancelada";
  productos: Producto[];
  total: number;
}

// 🔧 Convierte datos viejos (productos en string) a objetos
function normalizeOrdenes(data: any[]): Orden[] {
  return data.map((orden) => {
    if (typeof orden.productos === "string") {
      // ejemplo: "Fideos x2, Ravioles x1"
      const productosStr = orden.productos.split(",").map((p: string) => p.trim());
      orden.productos = productosStr.map((p: string) => {
        const match = p.match(/(.+?) x(\d+)/);
        const nombre = match ? match[1].trim() : p;
        const cantidad = match ? parseInt(match[2]) : 1;
        return { nombre, cantidad, precio: 0 };
      });
    }
    return orden;
  });
}

const initialData: Orden[] = [
  {
    id: 1,
    cliente: "Juan Pérez",
    fecha: "2025-10-30",
    tipo: "regular",
    estado: "Pendiente",
    productos: [
      { nombre: "Fideos", cantidad: 2, precio: 500 },
      { nombre: "Ravioles", cantidad: 1, precio: 500 }
    ],
    total: 1500
  },
  {
    id: 2,
    cliente: "María Gómez",
    fecha: "2025-10-31",
    tipo: "evento",
    estado: "En Proceso",
    productos: [{ nombre: "Ñoquis", cantidad: 5, precio: 500 }],
    total: 2500
  }
];

const OrdenesPage: React.FC = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return normalizeOrdenes(parsed);
    }
    return initialData;
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Orden | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ordenes));
  }, [ordenes]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ productos: [] });
    setModalVisible(true);
  };

  const handleEdit = (record: Orden) => {
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

      const productos: Producto[] = values.productos || [];
      const total = productos.reduce(
        (acc, p) => acc + p.cantidad * p.precio,
        0
      );

      const nuevaFecha = values.fecha.format("YYYY-MM-DD");

      if (editing) {
        const actualizadas = ordenes.map((orden) =>
          orden.id === editing.id
            ? { ...values, id: editing.id, fecha: nuevaFecha, productos, total }
            : orden
        );
        setOrdenes(actualizadas);
        message.success("Orden modificada correctamente");
      } else {
        const nueva: Orden = {
          ...values,
          id: ordenes.length + 1,
          fecha: nuevaFecha,
          productos,
          total
        };
        setOrdenes([...ordenes, nueva]);
        message.success("Orden registrada correctamente");
      }

      setModalVisible(false);
      form.resetFields();
      setEditing(null);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleDelete = (record: Orden) => {
    Modal.confirm({
      title: "¿Eliminar orden?",
      content: `Se eliminará la orden #${record.id}`,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: () => {
        setOrdenes(ordenes.filter((item) => item.id !== record.id));
        message.success("Orden eliminada");
      }
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Cliente", dataIndex: "cliente", key: "cliente" },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD")
    },
    { title: "Tipo", dataIndex: "tipo", key: "tipo" },
    { title: "Estado", dataIndex: "estado", key: "estado" },
    {
      title: "Productos",
      dataIndex: "productos",
      key: "productos",
      render: (productos: Producto[]) =>
        Array.isArray(productos)
          ? productos
              .map(
                (p) =>
                  `${p.nombre} x${p.cantidad} ($${(p.cantidad * p.precio).toFixed(
                    2
                  )})`
              )
              .join(", ")
          : "Sin productos"
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `$${total?.toFixed(2) || 0}`
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: Orden) => (
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
      <h2>Listado de Órdenes</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        Nueva Orden
      </Button>

      <Table columns={columns} dataSource={ordenes} rowKey="id" />

      <Modal
        title={editing ? "Editar Orden" : "Nueva Orden"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditing(null);
          form.resetFields();
        }}
        onOk={handleSave}
        okText="Guardar"
        cancelText="Cancelar"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="cliente"
            label="Cliente"
            rules={[{ required: true, message: "Ingrese el cliente" }]}
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
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: "Seleccione el tipo" }]}
          >
            <Select>
              <Option value="regular">Regular</Option>
              <Option value="evento">Evento</Option>
              <Option value="donacion">Donación</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: "Seleccione el estado" }]}
          >
            <Select>
              <Option value="Pendiente">Pendiente</Option>
              <Option value="En Proceso">En Proceso</Option>
              <Option value="Completada">Completada</Option>
              <Option value="Cancelada">Cancelada</Option>
            </Select>
          </Form.Item>

          {/* 🧩 Productos dinámicos */}
          <Form.List name="productos">
            {(fields, { add, remove }) => (
              <div>
                <h4>Productos</h4>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    align="baseline"
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      justifyContent: "space-between"
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "nombre"]}
                      rules={[{ required: true, message: "Ingrese el producto" }]}
                    >
                      <Input placeholder="Nombre" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "cantidad"]}
                      rules={[{ required: true, message: "Ingrese cantidad" }]}
                    >
                      <Input type="number" placeholder="Cantidad" min={1} />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "precio"]}
                      rules={[{ required: true, message: "Ingrese precio" }]}
                    >
                      <Input type="number" placeholder="Precio" min={0} step="0.01" />
                    </Form.Item>

                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  block
                >
                  Agregar producto
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default OrdenesPage;
