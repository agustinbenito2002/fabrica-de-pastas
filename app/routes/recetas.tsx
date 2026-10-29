import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getProductosRegistrados } from '../utils/productos';
import type { ProductoRegistrado } from '../utils/productos';
import { PageHeader } from '../components/PageHeader';
import { numberSorter, textSorter } from '../utils/tableSort';
import { getNextId } from '../utils/recordIds';

const { Option } = Select;

interface Ingrediente {
    id: number;
    nombre: string;
    cantidad: number;
    unidad: string;
}

interface Receta {
    id: number;
    nombre: string;
    ingredientes: Ingrediente[];
    productoFinal: {
        id: number;
        nombre: string;
    };
}

const RecetasPage: React.FC = () => {
    const [recetas, setRecetas] = useState<Receta[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [productos, setProductos] = useState<ProductoRegistrado[]>(getProductosRegistrados);
    const [busqueda, setBusqueda] = useState('');
    const recetasFiltradas = recetas.filter((receta) => {
        const q = busqueda.trim().toLowerCase();
        if (!q) return true;
        return [
            String(receta.id),
            receta.nombre,
            String(receta.productoFinal?.id ?? ''),
            receta.productoFinal?.nombre ?? '',
            ...receta.ingredientes.flatMap(ingrediente => [
                String(ingrediente.id),
                ingrediente.nombre,
                String(ingrediente.cantidad),
                ingrediente.unidad,
            ]),
        ].some(value => value.toLowerCase().includes(q));
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRecetas = localStorage.getItem('recetas-listado');
            if (savedRecetas) {
                setRecetas(JSON.parse(savedRecetas));
            }
        }
    }, []);

    useEffect(() => {
        const actualizarProductos = () => setProductos(getProductosRegistrados());
        window.addEventListener('storage', actualizarProductos);
        return () => window.removeEventListener('storage', actualizarProductos);
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
            sorter: numberSorter((receta: Receta) => receta.id),
        },
        {
            title: 'Nombre de Receta',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: textSorter((receta: Receta) => receta.nombre),
        },
        {
            title: 'Producto Final',
            dataIndex: 'productoFinal',
            key: 'productoFinal',
            sorter: textSorter((receta: Receta) => receta.productoFinal?.nombre),
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
            sorter: textSorter((receta: Receta) =>
                receta.ingredientes.map(ingrediente => ingrediente.nombre).join(', ')
            ),
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
        if (editingId !== null) {
            const newRecetas = recetas.map(receta =>
                receta.id === editingId ? { ...values, id: editingId } : receta
            );
            saveRecetas(newRecetas);
            message.success('Receta actualizada exitosamente');
        } else {
            const newReceta = {
                ...values,
                id: getNextId(recetas),
            };
            saveRecetas([...recetas, newReceta]);
            message.success('Receta creada exitosamente');
        }
        setModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    return (
        <div style={{ width: "100%" }}>
            <PageHeader title="Listado de Recetas" />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <Button type="primary" onClick={() => { setEditingId(null); form.resetFields(); setModalVisible(true); }}>
                    Nueva Receta
                </Button>
                <Input.Search
                    placeholder="Buscar por receta, producto o ingrediente"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ width: 360 }}
                    allowClear
                />
            </div>

            <Table columns={columns} dataSource={recetasFiltradas} rowKey="id" bordered style={{ width: "100%" }} pagination={{ pageSize: 10 }} />

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
                        <Form.Item name={['productoFinal', 'id']} hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name={['productoFinal', 'nombre']}
                            noStyle
                            rules={[{ required: true, message: 'Seleccione un producto' }]}
                        >
                            <Select
                                placeholder="Seleccione un producto"
                                showSearch
                                optionFilterProp="label"
                                style={{ width: '100%' }}
                                onChange={(nombre) => {
                                    const producto = productos.find((item) => item.nombre === nombre);
                                    form.setFieldValue(['productoFinal', 'id'], producto?.id);
                                }}
                            >
                                {productos.map((producto) => (
                                    <Option key={producto.id} value={producto.nombre} label={producto.nombre}>
                                        {producto.nombre}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form.Item>

                    <Form.List name="ingredientes">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} className="product-row" style={{ marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'nombre']}
                                            rules={[{ required: true, message: 'Nombre requerido' }]}
                                        >
                                            <Select
                                                placeholder="Seleccione un producto"
                                                showSearch
                                                optionFilterProp="label"
                                                onChange={(nombre) => {
                                                    const producto = productos.find((item) => item.nombre === nombre);
                                                    form.setFieldValue(['ingredientes', name, 'id'], producto?.id);
                                                }}
                                            >
                                                {productos.map((producto) => (
                                                    <Option key={producto.id} value={producto.nombre} label={producto.nombre}>
                                                        {producto.nombre}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'id']}
                                            hidden
                                        >
                                            <Input />
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