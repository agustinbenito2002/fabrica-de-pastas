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
                <section className="dashboard">
                    <div className="dashboard-hero">
                        <div className="dashboard-hero-content">
                            <Typography.Text className="dashboard-eyebrow">
                                CENTRO DE CONTROL <span />
                            </Typography.Text>
                            <Typography.Title level={1} className="dashboard-title">
                                Dashboard
                            </Typography.Title>
                            <Typography.Paragraph className="dashboard-description">
                                Gestioná la producción y las ventas de tu fábrica desde un solo lugar.
                            </Typography.Paragraph>
                        </div>
                        <div className="dashboard-orbit dashboard-orbit-one" />
                        <div className="dashboard-orbit dashboard-orbit-two" />
                    </div>
                    <div className="dashboard-section-heading">
                        <Typography.Title level={4}>Accesos rápidos</Typography.Title>
                        <Typography.Text type="secondary">Operaciones frecuentes</Typography.Text>
                    </div>
                    <Space wrap size="middle" className="dashboard-actions">
                        <Button
                            type="primary"
                            className="dashboard-action dashboard-action-primary"
                            icon={<ShoppingCartOutlined />}
                            onClick={() => setMostrarNuevaOrden(true)}
                        >
                            <span>
                                <span className="dashboard-action-title">Crear nueva orden</span>
                                <span className="dashboard-action-caption">Registrar un pedido</span>
                            </span>
                        </Button>
                        <Button
                            className="dashboard-action"
                            icon={<FileAddOutlined />}
                            onClick={() => setMostrarNuevoComprobante(true)}
                        >
                            <span>
                                <span className="dashboard-action-title">Nuevo comprobante</span>
                                <span className="dashboard-action-caption">Cargar una venta</span>
                            </span>
                        </Button>
                    </Space>
                </section>
            )}
        </SidebarLayout>
    );
}
