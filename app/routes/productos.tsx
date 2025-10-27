import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message } from "antd";

type Producto = {
  key: string;
  id: string;
  nombre: string;
  cantidad: number;
  precio?: number;
};

const LOCAL_STORAGE_KEY = "productos-listado";
const VENTAS_KEY = "ventas-listado";
const VENTAS_APLICADAS_KEY = "ventas-aplicadas-count";

const initialData: Producto[] = [
  { key: "1", id: "P-001", nombre: "Fideo Tallarín", cantidad: 500, precio: 120 },
  { key: "2", id: "P-002", nombre: "Ravioles", cantidad: 300, precio: 250 },
];

export default function ProductosPage() {
  const [data, setData] = useState<Producto[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalVisible, setModalVisible] = useState(false); // para registrar/editar producto completo
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form] = Form.useForm();

  // modal rápido para actualizar cantidad
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmForm] = Form.useForm();
  const [selected, setSelected] = useState<Producto | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Aplica ventas nuevas desde localStorage (espera que cada venta tenga .items: [{ id, cantidad }])
  const applyNewVentas = () => {
    try {
      const ventasRaw = localStorage.getItem(VENTAS_KEY);
      const ventas = ventasRaw ? JSON.parse(ventasRaw) : [];
      const appliedCountRaw = localStorage.getItem(VENTAS_APLICADAS_KEY);
      const appliedCount = appliedCountRaw ? Number(appliedCountRaw) : 0;
      if (!Array.isArray(ventas)) return;
      const newVentas = ventas.slice(appliedCount);
      if (newVentas.length === 0) return;
      const adjustments: Record<string, number> = {};
      newVentas.forEach((v: any) => {
        const items = Array.isArray(v.items) ? v.items : [];
        items.forEach((it: any) => {
          if (!it || !it.id) return;
          adjustments[it.id] = (adjustments[it.id] || 0) + Number(it.cantidad || 0);
        });
      });
      if (Object.keys(adjustments).length > 0) {
        setData(prev =>
          prev.map(p => {
            const sold = adjustments[p.id] || 0;
            if (!sold) return p;
            const nuevaCantidad = Math.max(0, p.cantidad - sold);
            if (nuevaCantidad !== p.cantidad) {
              message.info(`${p.nombre}: -${sold} unidades por ventas`);
            }
            return { ...p, cantidad: nuevaCantidad };
          })
        );
      }
      localStorage.setItem(VENTAS_APLICADAS_KEY, String(ventas.length));
    } catch (err) {
      console.error("Error aplicando ventas:", err);
    }
  };

  useEffect(() => {
    // aplicar ventas existentes al montar
    applyNewVentas();
    // reaccionar a cambios de localStorage (otras pestañas)
    const onStorage = (e: StorageEvent) => {
      if (e.key === VENTAS_KEY) applyNewVentas();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  // ahora abre modal controlado para actualizar cantidad
  const handleSelect = (record: Producto) => {
    setSelected(record);
    confirmForm.setFieldsValue({ cantidad: record.cantidad });
    setConfirmVisible(true);
  };

  const confirmSave = async () => {
    try {
      const values = await confirmForm.validateFields();
      if (selected) {
        setData(prev =>
          prev.map(p =>
            p.key === selected.key
              ? { ...p, cantidad: Number(values.cantidad) }
              : p
          )
        );
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
      const precio = values.precio !== undefined ? Number(values.precio) : 0;
      if (editing) {
        setData(prev =>
          prev.map(p =>
            p.key === editing.key
              ? { ...p, nombre: values.nombre, cantidad: Number(values.cantidad), precio }
              : p
          )
        );
        message.success("Producto modificado");
      } else {
        if (data.some(d => d.id === values.id)) {
          message.error("El ID ya existe");
          return;
        }
        const nuevo: Producto = {
          key: Date.now().toString(),
          id: values.id,
          nombre: values.nombre,
          cantidad: Number(values.cantidad),
          precio
        };
        setData(prev => [...prev, nuevo]);
        message.success("Producto registrado");
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
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      render: (val: number) => (val || val === 0 ? `${Number(val).toFixed(2)}` : "-"),
    },
  ];

  return (
    <div>
      <h2>Listado de Productos</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <Button type="primary" onClick={handleAdd}>Registrar producto</Button>
        <Button onClick={() => {
          const csv = ["ID,Nombre,Cantidad,Precio", ...data.map(d => `${d.id},${d.nombre},${d.cantidad},${d.precio ?? ""}`)].join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "productos.csv";
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

      {/* Modal para registrar/editar producto completo */}
      <Modal
        title={editing ? "Editar producto" : "Registrar producto"}
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
          <Form.Item label="Precio" name="precio" rules={[{ required: false }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}