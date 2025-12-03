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
const LOCAL_STORAGE_KEY = "compras-listado";

interface Producto {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Compra {
  id: number;
  numero?: string;
  proveedor: string;
  fecha: string;
  estado: "Pendiente" | "En Proceso" | "Completada" | "Cancelada";
  productos: Producto[];
  total: number;
}

// 🔧 Convierte datos viejos si el formato cambia
function normalizeCompras(data: any[]): Compra[] {
  return data.map((compra) => {
    if (typeof compra.productos === "string") {
      const productosStr = compra.productos.split(",").map((p: string) => p.trim());
      compra.productos = productosStr.map((p: string) => {
        const match = p.match(/(.+?) x(\d+)/);
        const nombre = match ? match[1].trim() : p;
        const cantidad = match ? parseInt(match[2]) : 1;
        return { nombre, cantidad, precio: 0 };
      });
    }
    return compra;
  });
}

const initialData: Compra[] = [
  {
    id: 1,
    proveedor: "Harinas del Sur",
    fecha: "2025-10-25",
    estado: "Pendiente",
    productos: [
      { nombre: "Harina 000", cantidad: 10, precio: 1000 },
      { nombre: "Huevos", cantidad: 5, precio: 800 }
    ],
    total: 14000
  },
  {
    id: 2,
    proveedor: "Empaque SRL",
    fecha: "2025-10-28",
    estado: "Completada",
    productos: [{ nombre: "Cajas de cartón", cantidad: 20, precio: 250 }],
    total: 5000
  }
];

const ComprasPage: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return normalizeCompras(parsed);
    }
    return initialData;
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Compra | null>(null);
  const [form] = Form.useForm();
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(compras));
  }, [compras]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ productos: [] });
    setModalVisible(true);
  };

  const handleEdit = (record: Compra) => {
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
        const actualizadas = compras.map((compra) =>
          compra.id === editing.id
            ? { ...values, id: editing.id, fecha: nuevaFecha, productos, total }
            : compra
        );
        setCompras(actualizadas);
        message.success("Orden de compra modificada correctamente");
      } else {
        const nueva: Compra = {
          ...values,
          id: compras.length + 1,
          fecha: nuevaFecha,
          productos,
          total
        };
        setCompras([...compras, nueva]);
        message.success("Orden de compra registrada correctamente");
      }

      setModalVisible(false);
      form.resetFields();
      setEditing(null);
    } catch (err) {
      console.error("Error al guardar:", err);
    }
  };

  const handleDelete = (record: Compra) => {
    Modal.confirm({
      title: "¿Eliminar orden de compra?",
      content: `Se eliminará la orden de compra #${record.id}`,
      okText: "Sí, eliminar",
      cancelText: "Cancelar",
      onOk: () => {
        setCompras(compras.filter((item) => item.id !== record.id));
        message.success("Orden de compra eliminada");
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
      title: "Presupuesto Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => `$${total?.toFixed(2) || 0}`
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: any, record: Compra) => (
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

  const comprasFiltradas = compras.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      c.proveedor?.toLowerCase().includes(q) ||
      c.numero?.toLowerCase().includes(q) ||
      c.fecha?.includes(q) ||
      (c.productos && String(c.productos).toLowerCase().includes(q)) ||
      String(c.id).includes(q)
    );
  });

  return (
    <div>
      <h2>Órdenes de Compra</h2>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <Button type="primary" onClick={handleAdd} style={{ marginRight: 8 }}>
            Nueva Orden de Compra
          </Button>
        </div>
        <Input.Search
          placeholder="Buscar por proveedor, número, fecha, producto o id"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={comprasFiltradas} rowKey="id" />

      <Modal
        title={editing ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
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
                <h4>Productos Comprados</h4>
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
                      <Input placeholder="Producto" />
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
                      <Input type="number" placeholder="Precio unitario" min={0} step="0.01" />
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

export default ComprasPage;
