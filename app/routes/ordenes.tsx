import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, Select, InputNumber, Space, message, Tag } from "antd";
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";

type OrderProduct = {
  productoId: string;
  nombre: string; 
  cantidad: number;
  precio: number;
  subtotal: number;
}

type Orden = {
  key: string;
  id: string;
  cliente: string;
  estado: string;
  fecha: string;
  tipo: 'normal' | 'donacion' | 'evento';
  productos: OrderProduct[];
  total: number;
};

const initialOrders: Orden[] = [
  {
    key: "1",
    id: "O-001",
    cliente: "Juan Pérez",
    estado: "Completa",
    fecha: "2025-10-01",
    tipo: "normal",
    productos: [
      { productoId: "P-001", nombre: "Fideo Tallarín", cantidad: 2, precio: 120, subtotal: 240 },
      { productoId: "P-002", nombre: "Ravioles", cantidad: 1, precio: 250, subtotal: 250 },
      { productoId: "P-003", nombre: "Ñoquis", cantidad: 3, precio: 180, subtotal: 540 }
    ],
    total: 1030
  },
  {
    key: "2", 
    id: "O-002",
    cliente: "Comedor Comunitario San Juan",
    estado: "Completa",
    fecha: "2025-10-05",
    tipo: "donacion",
    productos: [
      { productoId: "P-002", nombre: "Ravioles", cantidad: 10, precio: 0, subtotal: 0 },
      { productoId: "P-001", nombre: "Fideo Tallarín", cantidad: 15, precio: 0, subtotal: 0 },
      { productoId: "P-003", nombre: "Ñoquis", cantidad: 8, precio: 0, subtotal: 0 }
    ],
    total: 0
  },
  {
    key: "3",
    id: "O-003", 
    cliente: "Restaurante Italia",
    estado: "En proceso",
    fecha: "2025-10-15",
    tipo: "evento",
    productos: [
      { productoId: "P-001", nombre: "Fideo Tallarín", cantidad: 25, precio: 100, subtotal: 2500 },
      { productoId: "P-002", nombre: "Ravioles", cantidad: 20, precio: 200, subtotal: 4000 },
      { productoId: "P-004", nombre: "Sorrentinos", cantidad: 15, precio: 220, subtotal: 3300 }
    ],
    total: 9800
  },
  {
    key: "4",
    id: "O-004",
    cliente: "María González",
    estado: "Pendiente",
    fecha: "2025-10-20",
    tipo: "normal",
    productos: [
      { productoId: "P-002", nombre: "Ravioles", cantidad: 2, precio: 250, subtotal: 500 },
      { productoId: "P-003", nombre: "Ñoquis", cantidad: 1, precio: 180, subtotal: 180 }
    ],
    total: 680
  },
  {
    key: "5",
    id: "O-005",
    cliente: "Hospital Municipal",
    estado: "Completa",
    fecha: "2025-10-10",
    tipo: "donacion",
    productos: [
      { productoId: "P-001", nombre: "Fideo Tallarín", cantidad: 20, precio: 0, subtotal: 0 },
      { productoId: "P-003", nombre: "Ñoquis", cantidad: 15, precio: 0, subtotal: 0 }
    ],
    total: 0
  },
  {
    key: "6",
    id: "O-006",
    cliente: "Restaurante El Padrino",
    estado: "Pendiente",
    fecha: "2025-10-25",
    tipo: "evento",
    productos: [
      { productoId: "P-002", nombre: "Ravioles", cantidad: 30, precio: 200, subtotal: 6000 },
      { productoId: "P-004", nombre: "Sorrentinos", cantidad: 25, precio: 220, subtotal: 5500 }
    ],
    total: 11500
  },
  {
    key: "7",
    id: "O-007",
    cliente: "Carlos Rodríguez",
    estado: "En proceso",
    fecha: "2025-10-18",
    tipo: "normal",
    productos: [
      { productoId: "P-001", nombre: "Fideo Tallarín", cantidad: 3, precio: 120, subtotal: 360 },
      { productoId: "P-004", nombre: "Sorrentinos", cantidad: 2, precio: 250, subtotal: 500 }
    ],
    total: 860
  },
  {
    key: "8",
    id: "O-008",
    cliente: "Escuela N°123",
    estado: "Completa",
    fecha: "2025-10-12",
    tipo: "donacion",
    productos: [
      { productoId: "P-001", nombre: "Fideo Tallarín", cantidad: 25, precio: 0, subtotal: 0 },
      { productoId: "P-003", nombre: "Ñoquis", cantidad: 20, precio: 0, subtotal: 0 }
    ],
    total: 0
  }
];

const { Option } = Select;

export default function OrdenesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Orden[]>(() => {
    const saved = localStorage.getItem("ordenes-listado");
    return saved ? JSON.parse(saved) : initialOrders;
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Orden | null>(null);
  const [form] = Form.useForm();

  // Cargar productos disponibles
  const [productos, setProductos] = useState<any[]>(() => {
    const saved = localStorage.getItem("productos-listado");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("ordenes-listado", JSON.stringify(data));
  }, [data]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Orden) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      fecha: record.fecha,
      productos: record.productos
    });
    setModalVisible(true);
  };

  // Agregar función para volver al dashboard
  const volverDashboard = () => {
    navigate('/dashboard');
  };

  // Modificar handleSave para refrescar después de guardar
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const productos = values.productos || [];
      
      // Calcular subtotales y total
      const precioBase = values.tipo === 'donacion' ? 0 : undefined;
      const productosCalculados = productos.map((p: any) => ({
        ...p,
        precio: precioBase ?? p.precio,
        subtotal: precioBase ? 0 : (p.cantidad * p.precio)
      }));
      
      const total = productosCalculados.reduce((sum: number, p: OrderProduct) => sum + p.subtotal, 0);

      if (editing) {
        setData(prev => prev.map(o => (
          o.key === editing.key 
            ? { 
                ...o, 
                ...values,
                productos: productosCalculados,
                total,
                fecha: values.fecha.format ? values.fecha.format("YYYY-MM-DD") : values.fecha 
              } 
            : o
        )));
        message.success("Orden actualizada");
      } else {
        const nuevo: Orden = {
          key: Date.now().toString(),
          id: values.id,
          cliente: values.cliente,
          estado: values.estado,
          fecha: values.fecha.format("YYYY-MM-DD"),
          tipo: values.tipo,
          productos: productosCalculados,
          total
        };
        setData(prev => [...prev, nuevo]);
        message.success("Orden registrada");
      }
      
      // Cerrar modal y refrescar datos
      setModalVisible(false);
      form.resetFields();
      setEditing(null);
      
      // Forzar refresco de la tabla
      setData(prev => [...prev]);
    } catch {
      message.error("Por favor complete todos los campos requeridos");
    }
  };

  const columns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      key: "id",
      width: 100
    },
    { 
      title: "Cliente", 
      dataIndex: "cliente", 
      key: "cliente",
      width: 200 
    },
    { 
      title: "Estado", 
      dataIndex: "estado", 
      key: "estado",
      width: 120,
      render: (estado: string) => {
        const color = {
          'Pendiente': 'orange',
          'En proceso': 'blue',
          'Completa': 'green',
          'Cancelada': 'red'
        }[estado] || 'default';
        return <Tag color={color}>{estado}</Tag>;
      }
    },
    { 
      title: "Fecha", 
      dataIndex: "fecha", 
      key: "fecha",
      width: 120 
    },
    { 
      title: "Tipo", 
      dataIndex: "tipo", 
      key: "tipo",
      width: 120,
      render: (tipo: string) => {
        const color = {
          'normal': 'blue',
          'donacion': 'green',
          'evento': 'purple'
        }[tipo] || 'default';
        return <Tag color={color}>
          {({
            normal: "Normal",
            donacion: "Donación",
            evento: "Evento"
          }[tipo])}
        </Tag>;
      }
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 120,
      align: 'right' as const,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      render: (_: any, record: Orden) => (
        <Button type="link" onClick={() => handleEdit(record)}>Ver/Editar</Button>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      {/* Agregar header con navegación */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={volverDashboard}
          >
            Volver al Dashboard
          </Button>
          <h2 style={{ margin: 0 }}>Administrar Órdenes</h2>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          Registrar orden
        </Button>
      </div>

      {/* Tabla de órdenes */}
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="key"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} órdenes`,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '0 20px' }}>
              <Table
                columns={[
                  { 
                    title: 'Producto', 
                    dataIndex: 'nombre',
                    width: '40%'
                  },
                  { 
                    title: 'Cantidad', 
                    dataIndex: 'cantidad',
                    width: '20%',
                    align: 'right' as const
                  },
                  { 
                    title: 'Precio', 
                    dataIndex: 'precio',
                    width: '20%',
                    align: 'right' as const,
                    render: (value) => `$${value.toFixed(2)}`
                  },
                  { 
                    title: 'Subtotal', 
                    dataIndex: 'subtotal',
                    width: '20%',
                    align: 'right' as const,
                    render: (value) => `$${value.toFixed(2)}`
                  }
                ]}
                dataSource={record.productos}
                pagination={false}
                size="small"
                  bordered
                />
              </div>
          )
          }}
        />
  
        <Modal
          title={editing ? "Editar Orden" : "Nueva Orden"}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditing(null);
          }}
          width={800}
        >
          <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="ID"
            rules={[{ required: true, message: 'Ingrese el ID' }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>

          <Form.Item
            name="cliente"
            label="Cliente"
            rules={[{ required: true, message: 'Ingrese el cliente' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Seleccione el tipo' }]}
          >
            <Select>
              <Option value="normal">Normal</Option>
              <Option value="donacion">Donación</Option>
              <Option value="evento">Evento</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Seleccione el estado' }]}
          >
            <Select>
              <Option value="Pendiente">Pendiente</Option>
              <Option value="En proceso">En proceso</Option>
              <Option value="Completa">Completa</Option>
              <Option value="Cancelada">Cancelada</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fecha"
            label="Fecha"
            rules={[{ required: true, message: 'Seleccione la fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.List name="productos">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'productoId']}
                      rules={[{ required: true, message: 'Seleccione producto' }]}
                    >
                      <Select style={{ width: 200 }}>
                        {productos.map(p => (
                          <Option key={p.id} value={p.id}>{p.nombre}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'cantidad']}
                      rules={[{ required: true, message: 'Ingrese cantidad' }]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'precio']}
                      rules={[{ required: true, message: 'Ingrese precio' }]}
                    >
                      <InputNumber 
                        min={0}
                        disabled={form.getFieldValue('tipo') === 'donacion'}
                      />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>Eliminar</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Agregar Producto
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
