import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface Ingrediente {
    id: string;
    nombre: string;
    cantidad: number;
    unidad: string;
}

interface Receta {
    id: number;
    nombre: string;
    ingredientes: Ingrediente[];
    productoFinal: {
        id: string;
        nombre: string;
    };
}

const RecetasPage: React.FC = () => {
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRecetas = localStorage.getItem('recetas-listado');
            if (savedRecetas) {
                setRecetas(JSON.parse(savedRecetas));
            }
        }
    }, []);

    const saveRecetas = (newRecetas: Receta[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('recetas-listado', JSON.stringify(newRecetas));
            setRecetas(newRecetas);
        }
    };

    const columns: ColumnsType<Receta> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Nombre de Receta',
            dataIndex: 'nombre',
            key: 'nombre',
        },
        {
            title: 'Producto Final',
            dataIndex: 'productoFinal',
            key: 'productoFinal',
            render: (productoFinal) => (
                <span>
                    {productoFinal.nombre} (ID: {productoFinal.id})
                </span>
            ),
        },
        {
            title: 'Ingredientes',
            dataIndex: 'ingredientes',
            key: 'ingredientes',
            render: (ingredientes: Ingrediente[]) => (
                <ul>
                    {ingredientes.map((ing, index) => (
                        <li key={index}>
                            {ing.nombre} (ID: {ing.id}) - {ing.cantidad} {ing.unidad}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: '',
            key: '',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEdit(record)}>
                        Editar
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>
                        Eliminar
                    </Button>
                </Space>
            ),
        },
    ];

    const handleEdit = (receta: Receta) => {
        setEditingId(receta.id);
        form.setFieldsValue(receta);
        setModalVisible(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: '¿Está seguro de eliminar esta receta?',
            content: 'Esta acción no se puede deshacer',
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                const newRecetas = recetas.filter(receta => receta.id !== id);
                saveRecetas(newRecetas);
                message.success('Receta eliminada exitosamente');
            },
        });
    };

    const handleSubmit = (values: any) => {
        if (editingId) {
            const newRecetas = recetas.map(receta =>
                receta.id === editingId ? { ...values, id: editingId } : receta
            );
            saveRecetas(newRecetas);
            message.success('Receta actualizada exitosamente');
        } else {
            const newReceta = {
                ...values,
                id: recetas.length + 1,
            };
            saveRecetas([...recetas, newReceta]);
            message.success('Receta creada exitosamente');
        }
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    return (
        <div>
            <h2>Listado de Recetas</h2>
            <Button
                type="primary"
                onClick={() => {
                    setEditingId(null);
                    form.resetFields();
                    setModalVisible(true);
                }}
                style={{ marginBottom: 16 }}
            >
                Nueva Receta
            </Button>

            <Table columns={columns} dataSource={recetas} rowKey="id" />

            <Modal
                title={editingId ? "Editar Receta" : "Nueva Receta"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingId(null);
                }}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                >
                    <Form.Item
                        name="nombre"
                        label="Nombre de la Receta"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre de la receta' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Producto Final">
                        <Input.Group compact>
                            <Form.Item
                                name={['productoFinal', 'id']}
                                noStyle
                                rules={[{ required: true, message: 'Ingrese ID del producto' }]}
                            >
                                <Input placeholder="ID del producto" style={{ width: '30%' }} />
                            </Form.Item>
                            <Form.Item
                                name={['productoFinal', 'nombre']}
                                noStyle
                                rules={[{ required: true, message: 'Ingrese nombre del producto' }]}
                            >
                                <Input placeholder="Nombre del producto" style={{ width: '70%' }} />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>

                    <Form.List name="ingredientes">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            rules={[{ required: true, message: 'ID requerido' }]}
                                        >
                                            <Input placeholder="ID materia prima" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'nombre']}
                                            rules={[{ required: true, message: 'Nombre requerido' }]}
                                        >
                                            <Input placeholder="Nombre ingrediente" />
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'cantidad']}
                                            rules={[{ required: true, message: 'Cantidad requerida' }]}
                                        >
                                            <InputNumber placeholder="Cantidad" />
                                        </Form.Item>
                                       
                                        <Button onClick={() => remove(name)} type="link" danger>
                                            Eliminar
                                        </Button>
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block>
                                        Agregar Ingrediente
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

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

export default RecetasPage;