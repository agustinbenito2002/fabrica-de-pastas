import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Orden {
    id: number;
    cliente: string;
    fecha: string;
    tipo: 'evento'  | 'regular'| 'donacion';
    estado: 'Pendiente' | 'En Proceso' | 'Completada' | 'Cancelada';
    productos: string;
    total: number;
}

const OrdenesPage: React.FC = () => {
    const [ordenes, setOrdenes] = useState<Orden[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        // Verificar que estamos en el navegador antes de usar localStorage
        if (typeof window !== 'undefined') {
            const savedOrdenes = localStorage.getItem('ordenes-listado');
            if (savedOrdenes) {
                setOrdenes(JSON.parse(savedOrdenes));
            }
        }
    }, []);

    const saveOrdenes = (newOrdenes: Orden[]) => {
        // Verificar que estamos en el navegador antes de usar localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('ordenes-listado', JSON.stringify(newOrdenes));
            setOrdenes(newOrdenes);
        }
    };

    const handleEdit = (orden: Orden) => {
        setEditingId(orden.id);
        form.setFieldsValue({
            ...orden,
            fecha: orden.fecha,
        });
        setModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta orden?',
            content: 'Esta acción no se puede deshacer',
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                const newOrdenes = ordenes.filter(orden => orden.id !== id);
                saveOrdenes(newOrdenes);
                message.success('Orden eliminada exitosamente');
            },
        });
    };

    const handleSubmit = (values: any) => {
        // Convertir el total a número
        const ordenData = {
            ...values,
            total: Number(values.total)
        };

        if (editingId) {
            // Editar orden existente
            const newOrdenes = ordenes.map(orden =>
                orden.id === editingId ? { ...ordenData, id: editingId } : orden
            );
            saveOrdenes(newOrdenes);
            message.success('Orden actualizada exitosamente');
        } else {
            // Crear nueva orden
            const newOrden = {
                ...ordenData,
                id: ordenes.length + 1,
            };
            saveOrdenes([...ordenes, newOrden]);
            message.success('Orden creada exitosamente');
        }
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    const columns: ColumnsType<Orden> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Cliente',
            dataIndex: 'cliente',
            key: 'cliente',
        },
        {
            title: 'Fecha',
            dataIndex: 'fecha',
            key: 'fecha',
        },
        {            title: 'Tipo',
            dataIndex: 'tipo',
            key: 'tipo',
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
        },
        {
            title: 'Productos',
            dataIndex: 'productos',
            key: 'productos',
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total) => `$${Number(total).toFixed(2)}`,
        },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <span>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Editar
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>
                        Eliminar
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div>
            <h2>Administración de Órdenes</h2>
            <Button
                type="primary"
                onClick={() => {
                    setEditingId(null);
                    form.resetFields();
                    setModalVisible(true);
                }}
                style={{ marginBottom: 16 }}
            >
                Nueva Orden
            </Button>

            <Table columns={columns} dataSource={ordenes} rowKey="id" />

            <Modal
                title={editingId ? "Editar Orden" : "Nueva Orden"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingId(null);
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="cliente"
                        label="Cliente"
                        rules={[{ required: true, message: 'Por favor ingrese el cliente' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="fecha"
                        label="Fecha"
                        rules={[{ required: true, message: 'Por favor ingrese la fecha' }]}
                    >
                        <Input type="date" />
                    </Form.Item>

                    <Form.Item
                        name="tipo"
                        label="Tipo"
                        rules={[{ required: true, message: 'Por favor seleccione el tipo' }]}
                    >
                        <Select>
                            <Select.Option value="evento">Evento</Select.Option>
                            <Select.Option value="regular">Regular</Select.Option>
                            <Select.Option value="donacion">Donación</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="estado"
                        label="Estado"
                        rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
                    >
                        <Select>
                            <Select.Option value="Pendiente">Pendiente</Select.Option>
                            <Select.Option value="En Proceso">En Proceso</Select.Option>
                            <Select.Option value="Completada">Completada</Select.Option>
                            <Select.Option value="Cancelada">Cancelada</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="productos"
                        label="Productos"
                        rules={[{ required: true, message: 'Por favor ingrese los productos' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        name="total"
                        label="Total"
                        rules={[
                            { 
                                required: true, 
                                message: 'Por favor ingrese el total'
                            },
                            {
                                type: 'number',
                                transform: (value) => Number(value)
                            }
                        ]}
                    >
                        <Input 
                            type="number" 
                            prefix="$" 
                            step="0.01"
                            min="0"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingId ? 'Actualizar' : 'Crear'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OrdenesPage;