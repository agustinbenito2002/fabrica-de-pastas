import { useState } from "react";
import { Button, Flex, Space, Typography } from "antd";
import { ArrowLeftOutlined, FileAddOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { SidebarLayout } from "../SidebarLayout";
import ComprobantesVentaPage from "./comprovantesventa";
import OrdenesPage from "./ordenes";

export default function Dashboard() {
    const [mostrarNuevaOrden, setMostrarNuevaOrden] = useState(false);
    const [mostrarNuevoComprobante, setMostrarNuevoComprobante] = useState(false);

    return (
        <SidebarLayout>
            {mostrarNuevaOrden ? (
                <>
                    <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }} onClick={() => setMostrarNuevaOrden(false)}>
                        Volver al Dashboard
                    </Button>
                    <OrdenesPage abrirNuevaOrden />
                </>
            ) : mostrarNuevoComprobante ? (
                <>
                    <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: 16 }} onClick={() => setMostrarNuevoComprobante(false)}>
                        Volver al Dashboard
                    </Button>
                    <ComprobantesVentaPage abrirNuevo />
                </>
            ) : (
                <>
                    <Flex vertical gap={8}>
                        <Typography.Title level={2}>Dashboard</Typography.Title>
                        <Typography.Paragraph type="secondary">
                            Bienvenido al sistema de gestión de la fábrica de pastas.
                        </Typography.Paragraph>
                    </Flex>
                    <Space wrap size="middle" className="dashboard-actions">
                        <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => setMostrarNuevaOrden(true)}>
                            Crear Nueva Orden de Pedido
                        </Button>
                        <Button icon={<FileAddOutlined />} onClick={() => setMostrarNuevoComprobante(true)}>
                            Crear Comprobante de Venta
                        </Button>
                    </Space>
                </>
            )}
        </SidebarLayout>
    );
}
