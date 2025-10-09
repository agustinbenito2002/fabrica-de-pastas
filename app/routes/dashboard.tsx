import React, { useState } from "react";
import { Dropdown, Button, Menu } from "antd";
import { SidebarLayout } from "../SidebarLayout";
import ClientesPage from "./clientes";
import ComprobantesVentaPage from "./comprovantesventa";
import MaquinasPage from "./maquinas"; // Importa el nuevo componente

export default function Dashboard() {
    const [mostrarListado, setMostrarListado] = useState(false);
    const [mostrarComprobantes, setMostrarComprobantes] = useState(false);
    const [mostrarMaquinas, setMostrarMaquinas] = useState(false); // Nuevo estado

    const menu = (
        <Menu>
            <Menu.Item key="list" onClick={() => setMostrarListado(true)}>Listado de Clientes</Menu.Item>
        </Menu>
    );
    const comprobantes = (
        <Menu>
            <Menu.Item key="comprobantes" onClick={() => setMostrarComprobantes(true)}>Comprobantes de Venta</Menu.Item>
        </Menu>
    );

    const maquinaria = (
        <Menu>
            <Menu.Item key="list" onClick={() => setMostrarMaquinas(true)}>Listado de Maquinas</Menu.Item>
        </Menu>
    );

    const proveedores = (
        <Menu>
            <Menu.Item key="add" onClick={() => alert("Administrar proveedores")}>Agregar comprovante de compra</Menu.Item>
        </Menu>
    );

    return (
        <SidebarLayout>
            {mostrarListado ? (
                <div>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarListado(false)}>
                        Volver al Dashboard
                    </Button>
                    <ClientesPage />
                </div>
            ) : mostrarComprobantes ? (
                <div>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarComprobantes(false)}>
                        Volver al Dashboard
                    </Button>
                    <ComprobantesVentaPage />
                </div>
            ) : mostrarMaquinas ? (
                <div>
                    <Button style={{ marginBottom: 16 }} onClick={() => setMostrarMaquinas(false)}>
                        Volver al Dashboard
                    </Button>
                    <MaquinasPage />
                </div>
            ) : (
                <>
                    <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Dashboard</h1>
                    <p>Bienvenido al sistema de gestión de la fábrica de pastas.</p>
                    <div style={{ marginTop: 32 }}>
                        <Dropdown overlay={menu} trigger={["click"]}>
                            <Button type="primary">Administración de Clientes</Button>
                        </Dropdown>
                        <Dropdown overlay={comprobantes} trigger={["click"]}>
                            <Button type="primary">Comprobantes de Venta</Button>
                        </Dropdown>
                        <Dropdown overlay={maquinaria} trigger={["click"]}>
                            <Button type="primary">Administración de maquinas</Button>
                        </Dropdown>
                        <Dropdown overlay={proveedores} trigger={["click"]}>
                            <Button type="primary">Administración de proveedores</Button>
                        </Dropdown>
                    </div>
                </>
            )}
        </SidebarLayout>
    );
}
