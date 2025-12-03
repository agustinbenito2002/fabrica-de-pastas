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
  Space,
  InputNumber
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const LOCAL_STORAGE_KEY = "ordenes-mantenimiento-listado";

interface OrdenMantenimiento {
    id: number;
    maquina: string;
    fecha: string;
    tipoMantenimiento: 'Preventivo' | 'Correctivo' | 'Lubricación';
    estado: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
    responsable: string;
    descripcion: string;
    costo: number;
}

const initialData: OrdenMantenimiento[] = [
    {
        id: 1,
        maquina: "M-001 (Amasadora)",
        fecha: "2025-10-30",
        tipoMantenimiento: "Preventivo",
        estado: "Completada",
        responsable: "Juan Pérez",
        descripcion: "Revisión general y lubricación",
        costo: 500
    },
    {
        id: 2,
        maquina: "M-002 (Cortadora)",
        fecha: "2025-11-05",
        tipoMantenimiento: "Correctivo",
        estado: "En Proceso",
        responsable: "Ana Gómez",
        descripcion: "Reparación de motor",
        costo: 1200
    }
];

const OrdenesMantenimientoPage: React.FC = () => {
    const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        return saved ? JSON.parse(saved) : initialData;
    });

    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<OrdenMantenimiento | null>(null);
    const [form] = Form.useForm();
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ordenes));
    }, [ordenes]);

    const ordenesFiltradas = ordenes.filter((o) => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return true;
        return (
            o.maquina.toLowerCase().includes(q) ||
            o.tipoMantenimiento.toLowerCase().includes(q) ||
            o.estado.toLowerCase().includes(q) ||
            o.responsable.toLowerCase().includes(q) ||
            o.fecha.includes(q) ||
            String(o.id).includes(q)
        );
    });

    const handleAdd = () => {
        setEditing(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record: OrdenMantenimiento) => {
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

            if (editing) {
                const actualizadas = ordenes.map(orden =>
                    orden.id === editing.id
                        ? { ...values, id: editing.id, fecha: nuevaFecha }
                        : orden
                );
                setOrdenes(actualizadas);
                message.success("Orden de mantenimiento modificada correctamente");
            } else {
                const nueva: OrdenMantenimiento = {
                    ...values,
                    id: ordenes.length + 1,
                    fecha: nuevaFecha
                };
                setOrdenes([...ordenes, nueva]);
                message.success("Orden de mantenimiento registrada correctamente");
            }

            setModalVisible(false);
            form.resetFields();
            setEditing(null);
        } catch (err) {
            console.error("Error al guardar:", err);
        }
    };

    const handleDelete = (record: OrdenMantenimiento) => {
        Modal.confirm({
            title: "¿Eliminar orden de mantenimiento?",
            content: `Se eliminará la orden #${record.id}`,
            okText: "Sí, eliminar",
            cancelText: "Cancelar",
            onOk: () => {
                setOrdenes(ordenes.filter(item => item.id !== record.id));
                message.success("Orden de mantenimiento eliminada");
            }
        });
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Máquina", dataIndex: "maquina", key: "maquina" },
        {
            title: "Fecha",
            dataIndex: "fecha",
            key: "fecha",
            render: (text: string) => dayjs(text).format("YYYY-MM-DD")
        },
        { title: "Tipo", dataIndex: "tipoMantenimiento", key: "tipoMantenimiento" },
        { title: "Estado", dataIndex: "estado", key: "estado" },
        { title: "Responsable", dataIndex: "responsable", key: "responsable" },
        { title: "Descripción", dataIndex: "descripcion", key: "descripcion" },
        {
            title: "Costo",
            dataIndex: "costo",
            key: "costo",
            render: (costo: number) => `$${costo.toFixed(2)}`
        },
        {
            title: "Acciones",
            key: "acciones",
            render: (_: any, record: OrdenMantenimiento) => (
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
            <h2>Órdenes de Mantenimiento</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Button type="primary" onClick={handleAdd}>
                    Nueva Orden de Mantenimiento
                </Button>
                <Input.Search
                    placeholder="Buscar por máquina, responsable, tipo, estado o fecha"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: 360 }}
                    allowClear
                />
            </div>

            <Table columns={columns} dataSource={ordenesFiltradas} rowKey="id" />

            <Modal
                title={editing ? "Editar Orden de Mantenimiento" : "Nueva Orden de Mantenimiento"}
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
                        name="maquina"
                        label="Máquina"
                        rules={[{ required: true, message: "Ingrese la máquina" }]}
                    >
                        <Input placeholder="Ej: M-001 (Amasadora)" />
                    </Form.Item>

                    <Form.Item
                        name="fecha"
                        label="Fecha"
                        rules={[{ required: true, message: "Seleccione la fecha" }]}
                    >
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        name="tipoMantenimiento"
                        label="Tipo de Mantenimiento"
                        rules={[{ required: true, message: "Seleccione el tipo" }]}
                    >
                        <Select>
                            <Option value="Preventivo">Preventivo</Option>
                            <Option value="Correctivo">Correctivo</Option>
                            <Option value="Lubricación">Lubricación</Option>
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

                    <Form.Item
                        name="responsable"
                        label="Responsable"
                        rules={[{ required: true, message: "Ingrese el responsable" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="descripcion"
                        label="Descripción"
                        rules={[{ required: true, message: "Ingrese la descripción" }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item
                        name="costo"
                        label="Costo"
                        rules={[{ required: true, message: "Ingrese el costo" }]}
                    >
                        <InputNumber
                            prefix="$"
                            min={0}
                            step={0.01}
                            precision={2}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrdenesMantenimientoPage;