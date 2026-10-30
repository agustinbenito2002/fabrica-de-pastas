import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, message, Select, Descriptions } from "antd";
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
  unidadMedida?: string;
  stockMinimo?: number;
  costoUnitario?: number;
  proveedor?: string;
  fechaVencimiento?: string;
  lote?: string;
  estado?: "Disponible" | "Por reponer" | "Vencido";
};

type MateriaGuardada = Omit<Materia, "rubro"> & Partial<Pick<Materia, "rubro">>;

type Proveedor = {
  id: number;
  nombre: string;
};

const LOCAL_STORAGE_KEY = "materias-listado";
const PROVEEDORES_STORAGE_KEY = "proveedores-listado";

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
  const [viewing, setViewing] = useState<Materia | null>(null);
  const [form] = Form.useForm();
  const [rubros, setRubros] = useState(getRubrosRegistrados);
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => {
    const saved = localStorage.getItem(PROVEEDORES_STORAGE_KEY);
    if (!saved) return [];

    try {
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed as Proveedor[] : [];
    } catch (error) {
      console.error("No se pudieron cargar los proveedores guardados:", error);
      return [];
    }
  });
  const [busqueda, setBusqueda] = useState("");
  const materiasFiltradas = data.filter((materia) => {
    const q = busqueda.trim().toLowerCase();
    return !q || [
      String(materia.id),
      materia.nombre,
      materia.rubro,
      String(materia.cantidad),
      materia.unidadMedida ?? "",
      String(materia.stockMinimo ?? ""),
      String(materia.costoUnitario ?? ""),
      materia.proveedor ?? "",
      materia.fechaVencimiento ?? "",
      materia.lote ?? "",
      materia.estado ?? "",
    ]
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

  useEffect(() => {
    const actualizarProveedores = () => {
      const saved = localStorage.getItem(PROVEEDORES_STORAGE_KEY);
      if (!saved) {
        setProveedores([]);
        return;
      }

      try {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed)) {
          throw new Error("El listado guardado no es una lista de proveedores");
        }
        setProveedores(parsed as Proveedor[]);
      } catch (error) {
        console.error("No se pudieron actualizar los proveedores:", error);
      }
    };

    window.addEventListener("storage", actualizarProveedores);
    return () => window.removeEventListener("storage", actualizarProveedores);
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
        setData(prev => prev.map(m => (
          m.key === editing.key
            ? {
                ...m,
                ...values,
                cantidad: Number(values.cantidad),
                stockMinimo: values.stockMinimo === undefined ? undefined : Number(values.stockMinimo),
                costoUnitario: values.costoUnitario === undefined ? undefined : Number(values.costoUnitario),
              }
            : m
        )));
        message.success("Insumo modificado");
      } else {
        const nueva: Materia = {
          ...values,
          key: Date.now().toString(),
          id: getNextId(data),
          cantidad: Number(values.cantidad),
          stockMinimo: values.stockMinimo === undefined ? undefined : Number(values.stockMinimo),
          costoUnitario: values.costoUnitario === undefined ? undefined : Number(values.costoUnitario),
        };
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
    { title: "Unidad de medida", dataIndex: "unidadMedida", key: "unidadMedida", sorter: textSorter((materia: Materia) => materia.unidadMedida ?? ""), render: unidad => unidad || "—" },
    { title: "Stock mínimo", dataIndex: "stockMinimo", key: "stockMinimo", sorter: numberSorter((materia: Materia) => materia.stockMinimo ?? 0), render: stock => stock ?? "—" },
    { title: "Costo unitario", dataIndex: "costoUnitario", key: "costoUnitario", sorter: numberSorter((materia: Materia) => materia.costoUnitario ?? 0), render: costo => costo === undefined ? "—" : `$${Number(costo).toFixed(2)}` },
    { title: "Proveedor", dataIndex: "proveedor", key: "proveedor", sorter: textSorter((materia: Materia) => materia.proveedor ?? ""), render: proveedor => proveedor || "—" },
    { title: "Vencimiento", dataIndex: "fechaVencimiento", key: "fechaVencimiento", sorter: textSorter((materia: Materia) => materia.fechaVencimiento ?? ""), render: fecha => fecha || "—" },
    { title: "Lote", dataIndex: "lote", key: "lote", sorter: textSorter((materia: Materia) => materia.lote ?? ""), render: lote => lote || "—" },
    { title: "Estado", dataIndex: "estado", key: "estado", sorter: textSorter((materia: Materia) => materia.estado ?? ""), render: estado => estado || "—" },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Materia) => (
        <>
          <Button type="link" onClick={() => setViewing(record)}>
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
      <PageHeader title="Insumos" />

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>Nuevo Insumo</Button>
        <Input.Search
          placeholder="Buscar por insumo, rubro, proveedor o estado"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: 360 }}
          allowClear
        />
      </div>

      <Table columns={columns} dataSource={materiasFiltradas} rowKey="id" bordered style={{ width: "100%" }} scroll={{ x: "max-content" }} pagination={{ pageSize: 10 }} />

      <Modal
        className="ingredient-details-modal"
        title={viewing ? `Detalle del insumo: ${viewing.nombre}` : "Detalle del insumo"}
        open={viewing !== null}
        onCancel={() => setViewing(null)}
        footer={<Button onClick={() => setViewing(null)}>Cerrar</Button>}
        width={1100}
      >
        {viewing && (
          <div className="ingredient-details-content">
            <Descriptions
              bordered
              size="small"
              column={3}
              items={[
                { key: "id", label: "ID", children: viewing.id },
                { key: "nombre", label: "Nombre", children: viewing.nombre || "—" },
                { key: "rubro", label: "Rubro", children: viewing.rubro || "—" },
                { key: "cantidad", label: "Cantidad", children: viewing.cantidad ?? "—" },
                { key: "unidadMedida", label: "Unidad de medida", children: viewing.unidadMedida || "—" },
                { key: "stockMinimo", label: "Stock mínimo", children: viewing.stockMinimo ?? "—" },
                {
                  key: "costoUnitario",
                  label: "Costo unitario",
                  children: viewing.costoUnitario === undefined ? "—" : `$${Number(viewing.costoUnitario).toFixed(2)}`,
                },
                { key: "proveedor", label: "Proveedor", children: viewing.proveedor || "—" },
                { key: "fechaVencimiento", label: "Fecha de vencimiento", children: viewing.fechaVencimiento || "—" },
                { key: "lote", label: "Lote", children: viewing.lote || "—" },
                { key: "estado", label: "Estado", children: viewing.estado || "—" },
              ]}
            />
          </div>
        )}
      </Modal>

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
        className="ingredient-form-modal"
        title={editing ? "Editar insumo" : "Registrar insumo"}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); setEditing(null); }}
        onOk={handleSave}
        okText="Guardar"
        width={1200}
      >
        <Form form={form} layout="vertical" className="ingredient-form">
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
          <Form.Item label="Unidad de medida" name="unidadMedida">
            <Select
              placeholder="Seleccione una unidad"
              options={[
                { value: "kg", label: "Kilogramos (kg)" },
                { value: "g", label: "Gramos (g)" },
                { value: "l", label: "Litros (l)" },
                { value: "ml", label: "Mililitros (ml)" },
                { value: "unidad", label: "Unidades" },
                { value: "docena", label: "Docenas" },
                { value: "bolsa", label: "Bolsas" },
                { value: "paquete", label: "Paquetes" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Stock mínimo" name="stockMinimo">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Costo unitario" name="costoUnitario">
            <InputNumber min={0} precision={2} prefix="$" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Proveedor" name="proveedor">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder={proveedores.length ? "Seleccione un proveedor" : "No hay proveedores registrados"}
              options={proveedores.map(proveedor => ({
                value: proveedor.nombre,
                label: proveedor.nombre,
              }))}
            />
          </Form.Item>
          <Form.Item label="Fecha de vencimiento" name="fechaVencimiento">
            <Input type="date" />
          </Form.Item>
          <Form.Item label="Lote" name="lote">
            <Input />
          </Form.Item>
          <Form.Item label="Estado" name="estado">
            <Select
              placeholder="Seleccione un estado"
              options={[
                { value: "Disponible", label: "Disponible" },
                { value: "Por reponer", label: "Por reponer" },
                { value: "Vencido", label: "Vencido" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}