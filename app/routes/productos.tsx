import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PageHeader } from "../components/PageHeader";
import { getRubrosRegistrados } from "../utils/rubros";
import { numberSorter, textSorter } from "../utils/tableSort";
import { getNextId } from "../utils/recordIds";
import { showRecordDetails } from "../utils/recordDetails";

type Producto = {
  key: string;
  id: number;
  nombre: string;
  rubro: string;
  recetaId: string;
  cantidad: number;
  precio?: number;
};

type Receta = {
  id: number;
  nombre: string;
};

const LOCAL_STORAGE_KEY = "productos-listado";
const VENTAS_KEY = "ventas-listado";
const VENTAS_APLICADAS_KEY = "ventas-aplicadas-count";
const RECETAS_KEY = "recetas-listado";

const initialData: Producto[] = [
  { key: "1", id: 1, nombre: "Fideo Tallarín", rubro: "", recetaId: "", cantidad: 500, precio: 120 },
  { key: "2", id: 2, nombre: "Ravioles", rubro: "", recetaId: "", cantidad: 300, precio: 250 },
];

type ProductoGuardado = Omit<Producto, "rubro" | "recetaId"> & Partial<Pick<Producto, "rubro" | "recetaId">>;

export default function ProductosPage() {
  const [data, setData] = useState<Producto[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return initialData;

    const savedData: ProductoGuardado[] = JSON.parse(saved);
    return savedData.map(producto => ({
      ...producto,
      rubro: producto.rubro ?? "",
      recetaId: producto.recetaId ?? "",
    }));
  });
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [rubros, setRubros] = useState(getRubrosRegistrados);
  const [modalVisible, setModalVisible] = useState(false); // para registrar/editar producto completo
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form] = Form.useForm();
  const [busqueda, setBusqueda] = useState("");
  const productosFiltrados = data.filter((producto) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    const receta = recetas.find(item => String(item.id) === producto.recetaId);
    return [
      String(producto.id),
      producto.nombre,
      producto.rubro,
      producto.recetaId,
      receta?.nombre ?? "",
      String(producto.cantidad),
      String(producto.precio ?? ""),
    ].some(value => value.toLowerCase().includes(q));
  });

  // modal rápido para actualizar cantidad
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmForm] = Form.useForm();
  const [selected, setSelected] = useState<Producto | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const cargarRecetas = () => {
      const saved = localStorage.getItem(RECETAS_KEY);
      setRecetas(saved ? JSON.parse(saved) : []);
    };

    cargarRecetas();
    window.addEventListener("storage", cargarRecetas);
    return () => window.removeEventListener("storage", cargarRecetas);
  }, []);

  useEffect(() => {
    const actualizarRubros = () => setRubros(getRubrosRegistrados());
    window.addEventListener("storage", actualizarRubros);
    return () => window.removeEventListener("storage", actualizarRubros);
  }, []);

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

  const handleEdit = (record: Producto) => {
    setEditing(record);
    form.setFieldsValue(record);
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
              ? { ...p, nombre: values.nombre, rubro: values.rubro, recetaId: values.recetaId ?? "", cantidad: Number(values.cantidad), precio }
              : p
          )
        );
        message.success("Producto modificado");
      } else {
        const nuevo: Producto = {
          key: Date.now().toString(),
          id: getNextId(data),
          nombre: values.nombre,
          rubro: values.rubro,
          recetaId: values.recetaId ?? "",
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

  const columns: ColumnsType<Producto> = [
    { title: "ID", dataIndex: "id", key: "id", sorter: numberSorter((producto: Producto) => producto.id) },
    { title: "Nombre", dataIndex: "nombre", key: "nombre", sorter: textSorter((producto: Producto) => producto.nombre) },
    { title: "Rubro", dataIndex: "rubro", key: "rubro", sorter: textSorter((producto: Producto) => producto.rubro), render: rubro => rubro || "—" },
    {
      title: "Receta",
      dataIndex: "recetaId",
      key: "receta",
      sorter: textSorter((producto: Producto) =>
        recetas.find(receta => String(receta.id) === producto.recetaId)?.nombre ?? ""
      ),
      render: recetaId => recetas.find(receta => String(receta.id) === recetaId)?.nombre || "—",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      sorter: numberSorter((producto: Producto) => producto.cantidad),
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      sorter: numberSorter((producto: Producto) => producto.precio),
      render: (val: number) => (val || val === 0 ? `${Number(val).toFixed(2)}` : "-"),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Producto) => (
        <>
          <Button type="link" onClick={() => showRecordDetails("Detalle del producto", record)}>
            Ver
          </Button>
          <Button type="link" onClick={() => handleEdit(record)}>
            Editar
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <PageHeader title="Productos" />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>Nuevo Producto</Button>
        <Input.Search
          placeholder="Buscar por ID, nombre, rubro, receta o cantidad"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={productosFiltrados} rowKey="key" bordered style={{ width: "100%" }} pagination={{ pageSize: 10 }} />

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
          <Form.Item label="Nombre" name="nombre" rules={[{ required: true, message: "Ingrese nombre" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Rubro" name="rubro" rules={[{ required: true, message: "Seleccione un rubro" }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Seleccione un rubro"
              options={rubros.map((rubro) => ({ value: rubro, label: rubro }))}
            />
          </Form.Item>
          <Form.Item label="Receta" name="recetaId">
            <Select
              allowClear
              placeholder="Seleccione una receta"
              options={recetas.map(receta => ({
                value: String(receta.id),
                label: receta.nombre,
              }))}
            />
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